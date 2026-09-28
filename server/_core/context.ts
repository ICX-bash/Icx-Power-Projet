import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getMicrosoftAdminSessionUser } from "./microsoftAdmin";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    // The separately-built admin app explicitly opts into the Microsoft session.
    // The public client never sends this header and continues using Manus OAuth.
    if (opts.req.header("x-icx-admin-console") === "1") {
      user = await getMicrosoftAdminSessionUser(opts.req);
    } else {
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch {
    // Authentication is optional for public procedures.
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}
