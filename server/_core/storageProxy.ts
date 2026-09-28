import type { Express } from "express";
import { getServiceDocumentByFileKey } from "../db";
import { sdk } from "./sdk";
import { getMicrosoftAdminSessionUser } from "./microsoftAdmin";
import { ENV } from "./env";

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as Record<string, string>)[0];
    if (!key || key.includes("..") || key.includes("\\")) {
      res.status(404).send("Document introuvable");
      return;
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(503).send("Stockage des documents non configuré");
      return;
    }

    try {
      const adminUser = await getMicrosoftAdminSessionUser(req);
      const user = adminUser ?? await sdk.authenticateRequest(req).catch(() => null);
      if (!user) {
        res.status(401).send("Connexion requise");
        return;
      }
      const document = await getServiceDocumentByFileKey(key);
      if (!document || (!adminUser && document.userId !== user.id)) {
        res.status(404).send("Document introuvable");
        return;
      }

      const forgeUrl = new URL("v1/storage/presign/get", ENV.forgeApiUrl.replace(/\/+$/, "") + "/");
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
        signal: AbortSignal.timeout(15_000),
      });
      if (!forgeResp.ok) {
        console.error(`[StorageProxy] Forge returned HTTP ${forgeResp.status}`);
        res.status(502).send("Le fournisseur de stockage est indisponible");
        return;
      }
      const { url } = await forgeResp.json() as { url?: string };
      if (!url) {
        res.status(502).send("URL sécurisée indisponible");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (error) {
      console.error("[StorageProxy] Download failed:", error instanceof Error ? error.message : "unknown error");
      res.status(502).send("Impossible de télécharger le document");
    }
  });
}
