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

export function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
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

export async function sendTransactionalEmail(input: TransactionalEmail): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return { sent: false, error: "Resend n’est pas configuré sur le serveur." };

  const fromName = process.env.RESEND_FROM_NAME?.trim() || "ICX Power Solutions";
  const replyTo = input.replyTo || process.env.RESEND_REPLY_TO || undefined;
  const payload: Record<string, unknown> = {
    from: `${fromName} <${fromEmail}>`,
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html,
    reply_to: replyTo,
  };
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key];
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
    if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey.slice(0, 256);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const responseBody = await response.json().catch(() => ({})) as { id?: string; message?: string; name?: string };
    if (!response.ok) {
      const error = `Resend HTTP ${response.status}: ${responseBody.message || responseBody.name || "échec d’envoi"}`;
      console.warn("[Resend] Email rejected:", error);
      return { sent: false, error };
    }
    return { sent: true, id: responseBody.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "erreur réseau";
    console.error("[Resend] Email request failed:", message);
    return { sent: false, error: "Échec de connexion au service Resend." };
  }
}
