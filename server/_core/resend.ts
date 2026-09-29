export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey?: string;
};

export type TransactionalEmailResult = {
  sent: boolean;
  id?: string;
  error?: string;
};

type ResendErrorResponse = {
  name?: string;
  message?: string;
  statusCode?: number;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TIMEOUT_MS = 15_000;

function cleanEnv(value: string | undefined) {
  // Render stocke normalement la valeur telle quelle. Cette tolérance évite
  // qu'une valeur copiée avec des guillemets casse l'appel API.
  return value?.trim().replace(/^['"]|['"]$/g, "").trim() || "";
}

function isValidEmail(value: string) {
  // Validation volontairement simple : Resend réalise la validation complète.
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
}

function getResendConfig() {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  const fromEmail = cleanEnv(process.env.RESEND_FROM_EMAIL);
  const fromName = cleanEnv(process.env.RESEND_FROM_NAME) || "ICX Power Solutions";
  const defaultReplyTo = cleanEnv(process.env.RESEND_REPLY_TO);

  if (!apiKey) {
    return { error: "RESEND_API_KEY est absente dans les variables Render." } as const;
  }
  if (!apiKey.startsWith("re_")) {
    return { error: "RESEND_API_KEY ne ressemble pas à une clé API Resend valide." } as const;
  }
  if (!fromEmail) {
    return { error: "RESEND_FROM_EMAIL est absente dans les variables Render." } as const;
  }
  if (!isValidEmail(fromEmail)) {
    return { error: "RESEND_FROM_EMAIL doit être une adresse seule, par exemple noreply@votre-domaine.com." } as const;
  }
  if (!isValidEmail(defaultReplyTo) && defaultReplyTo) {
    return { error: "RESEND_REPLY_TO n’est pas une adresse e-mail valide." } as const;
  }
  if (/[\r\n<>]/.test(fromName)) {
    return { error: "RESEND_FROM_NAME contient des caractères non autorisés." } as const;
  }

  return { apiKey, fromEmail, fromName, defaultReplyTo } as const;
}

export function resendConfigured() {
  return !("error" in getResendConfig());
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!);
}

function safeHeaderValue(value: string, fieldName: string) {
  if (/[\r\n]/.test(value)) {
    throw new Error(`${fieldName} contient un retour à la ligne interdit.`);
  }
  return value.trim();
}

async function readResendResponse(response: Response): Promise<ResendErrorResponse & { id?: string }> {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ResendErrorResponse & { id?: string };
  } catch {
    return { message: raw.slice(0, 500) };
  }
}

export async function sendTransactionalEmail(input: TransactionalEmail): Promise<TransactionalEmailResult> {
  const config = getResendConfig();
  if ("error" in config) {
    console.error(`[Resend] Configuration invalide: ${config.error}`);
    return { sent: false, error: config.error };
  }

  const to = cleanEnv(input.to);
  if (!isValidEmail(to)) {
    const error = "Le destinataire n’est pas une adresse e-mail valide.";
    console.error(`[Resend] ${error}`);
    return { sent: false, error };
  }

  let subject: string;
  let from: string;
  let replyTo: string | undefined;
  try {
    subject = safeHeaderValue(input.subject, "subject");
    from = safeHeaderValue(`${config.fromName} <${config.fromEmail}>`, "from");
    const candidateReplyTo = cleanEnv(input.replyTo) || config.defaultReplyTo;
    replyTo = candidateReplyTo ? safeHeaderValue(candidateReplyTo, "reply_to") : undefined;
  } catch (error) {
    const message = error instanceof Error ? error.message : "En-tête e-mail invalide.";
    console.error(`[Resend] ${message}`);
    return { sent: false, error: message };
  }

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    text: input.text,
    html: input.html || undefined,
    reply_to: replyTo,
  };
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    if (input.idempotencyKey) {
      headers["Idempotency-Key"] = input.idempotencyKey.slice(0, 256);
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const responseBody = await readResendResponse(response);

    if (!response.ok) {
      const providerMessage = responseBody.message || responseBody.name || "Requête refusée par Resend.";
      const error = `Resend HTTP ${response.status}: ${providerMessage}`;
      // La clé API et le contenu du message ne sont jamais écrits dans les logs.
      console.error(`[Resend] Échec d’envoi vers ${to}: ${error}`);
      return { sent: false, error };
    }

    if (!responseBody.id) {
      const error = "Resend a accepté la requête mais n’a renvoyé aucun identifiant de message.";
      console.error(`[Resend] ${error}`);
      return { sent: false, error };
    }

    console.info(`[Resend] E-mail accepté, id=${responseBody.id}, destinataire=${to}`);
    return { sent: true, id: responseBody.id };
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "AbortError";
    const message = isTimeout
      ? `Délai dépassé après ${DEFAULT_TIMEOUT_MS / 1000} secondes lors de l’appel HTTPS à Resend.`
      : error instanceof Error
        ? error.message
        : "Erreur réseau inconnue lors de l’appel à Resend.";
    console.error(`[Resend] ${message}`);
    return { sent: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
