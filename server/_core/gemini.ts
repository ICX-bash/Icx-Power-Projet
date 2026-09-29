import { ENV } from "./env";

export type GeminiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function invokeGeminiChat(input: {
  systemPrompt: string;
  messages: GeminiChatMessage[];
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = ENV.geminiApiKey.trim();
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  const model = ENV.geminiModel.trim() || "gemini-3.8-flash";
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) {
    throw new Error("Gemini model name is invalid");
  }

  // Gemini expects the first conversation turn to come from the user. The
  // client includes an assistant welcome card as its first displayed message;
  // it is already covered by the system prompt, so omit only leading assistant
  // turns when building the provider history.
  const history = [...input.messages];
  while (history[0]?.role === "assistant") history.shift();

  if (history.length === 0) {
    throw new Error("Gemini chat requires at least one user message");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: input.systemPrompt }] },
        contents: history.map(message => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens ?? 1200,
        },
      }),
      signal: AbortSignal.timeout(30_000),
    }
  );

  if (!response.ok) {
    // Keep provider details out of the public response and avoid logging the
    // user's conversation. The status is sufficient for server-side diagnosis.
    throw new Error(`Gemini API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const answer = payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text ?? "")
    .join("")
    .trim();

  if (!answer) {
    throw new Error("Gemini API returned no text content");
  }

  return answer;
}
