import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { Session } from "@contracts/constants";
import { users } from "@db/schema";
import { getDb } from "./queries/connection";
import { verifySessionToken } from "./lib/session";

/** Resolves the signed-in user from the session cookie, or undefined. */
export async function authenticateRequest(headers: Headers) {
  const token = cookie.parse(headers.get("cookie") || "")[Session.cookieName];
  if (!token) return undefined;

  const claim = await verifySessionToken(token);
  if (!claim) return undefined;

  const rows = await getDb().select().from(users).where(eq(users.id, claim.userId)).limit(1);
  return rows.at(0);
}
