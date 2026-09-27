import { describe, expect, it, vi } from "vitest";

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [{ message: { content: "Réponse ICX test" } }],
  })),
}));

import { appRouter } from "./routers";

describe("ai.chat", () => {
  it("returns the assistant response for a valid user message", async () => {
    const caller = appRouter.createCaller({
      user: undefined,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.ai.chat({
      messages: [{ role: "user", content: "Comment préparer un projet d'études ?" }],
    });

    expect(result).toEqual({ content: "Réponse ICX test" });
  });
});
