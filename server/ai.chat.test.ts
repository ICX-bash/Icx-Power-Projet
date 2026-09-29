import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: "Réponse ICX test" } }],
  })),
}));

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
  it("returns the assistant response and uses GPT-5's supported token limit", async () => {
    const caller = createCaller();
    const result = await caller.ai.chat(userMessage);

    expect(result).toEqual({ content: "Réponse ICX test" });
    expect(invokeLLM).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-5",
        reasoning: { effort: "medium" },
        maxCompletionTokens: 1200,
      })
    );
  });

  it("returns a safe service-unavailable error when the provider fails", async () => {
    vi.mocked(invokeLLM).mockRejectedValueOnce(
      new Error("private upstream response")
    );

    await expect(createCaller().ai.chat(userMessage)).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      message:
        "ICX Intelligence est momentanément indisponible. Réessayez dans quelques instants.",
    });
  });
});
