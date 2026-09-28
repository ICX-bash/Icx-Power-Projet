import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const publicContext = {
  user: undefined,
  req: {} as any,
  res: {} as any,
};

describe("requests and notifications access", () => {
  it("rejects unauthenticated service submissions", async () => {
    const caller = appRouter.createCaller(publicContext);

    await expect(
      caller.requests.create({
        serviceKey: "etudes",
        firstName: "Test",
        lastName: "Client",
        email: "test@example.com",
        message: "Je souhaite préparer mon dossier.",
        attachments: [],
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated notification access", async () => {
    const caller = appRouter.createCaller(publicContext);

    await expect(caller.notifications.mine()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
