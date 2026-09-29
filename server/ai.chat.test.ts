import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: "Réponse ICX test" } }],
  })),
}));

vi.mock("./_core/gemini", () => ({
  invokeGeminiChat: vi.fn(async () => "Réponse Gemini test"),
}));

vi.mock("./_core/env", async importOriginal => {
  const actual = await importOriginal<typeof import("./_core/env")>();
  return {
    ...actual,
    ENV: {
      ...actual.ENV,
      llmApiKey: actual.ENV.llmApiKey || "test-primary-key",
      geminiApiKey: "test-gemini-key",
      geminiModel: "gemini-3.8-flash",
    },
  };
});

import { ENV } from "./_core/env";
import { invokeGeminiChat } from "./_core/gemini";
import { invokeLLM } from "./_core/llm";
import { appRouter } from "./routers";

const createCaller = () =>
  appRouter.createCaller({
    user: undefined,
    req: {} as any,
    res: {} as any,
  });

const userMessage = {
  messages: [
    { role: "user" as const, content: "Comment préparer un projet d'études ?" },
  ],
};

beforeEach(() => vi.clearAllMocks());

describe("ai.chat", () => {
  it("returns the primary response and uses GPT-5's supported token limit", async () => {
    const result = await createCaller().ai.chat(userMessage);

    expect(result).toEqual({ content: "Réponse ICX test" });
    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5",
        reasoning: { effort: "medium" },
        maxCompletionTokens: 1200,
      })
    );
    expect(invokeGeminiChat).not.toHaveBeenCalled();
  });

  it("falls back to Gemini when GPT-5 fails", async () => {
    vi.mocked(invokeLLM).mockRejectedValueOnce(
      new Error("primary unavailable")
    );

    const result = await createCaller().ai.chat(userMessage);

    expect(result).toEqual({ content: "Réponse Gemini test" });
    expect(invokeGeminiChat).toHaveBeenCalledWith(
      expect.objectContaining({
        maxOutputTokens: 1200,
        messages: userMessage.messages,
      })
    );
  });

  it("uses Gemini if it is configured as the only provider", async () => {
    const previousPrimaryKey = ENV.llmApiKey;
    ENV.llmApiKey = "";
    try {
      const result = await createCaller().ai.chat(userMessage);
      expect(result).toEqual({ content: "Réponse Gemini test" });
      expect(invokeLLM).not.toHaveBeenCalled();
      expect(invokeGeminiChat).toHaveBeenCalledOnce();
    } finally {
      ENV.llmApiKey = previousPrimaryKey;
    }
  });

  it("returns a safe service-unavailable error when all configured providers fail", async () => {
    vi.mocked(invokeLLM).mockRejectedValueOnce(
      new Error("private primary response")
    );
    vi.mocked(invokeGeminiChat).mockRejectedValueOnce(
      new Error("private Gemini response")
    );

    await expect(createCaller().ai.chat(userMessage)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "ICX Intelligence est momentanément indisponible. Réessayez dans quelques instants.",
    });
  });
});
