import { z } from "zod";
import * as cookie from "cookie";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { users } from "@db/schema";
import { getSessionCookieOptions } from "./lib/cookies";
import { signSessionToken } from "./lib/session";
import { verifyPassword } from "./lib/password";
import { getDb } from "./queries/connection";
import { createRouter, authedQuery, publicQuery } from "./middleware";

/**
 * ponytail: in-memory failed-attempt throttle — resets on restart and is
 * per-process, so it won't hold across a multi-instance deploy. Move to a
 * `login_attempts` table or Redis if the store ever runs more than one node.
 */
const LOCK_AFTER = 8;
const LOCK_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; until: number }>();

function checkLock(key: string) {
  const entry = attempts.get(key);
  if (!entry) return;
  if (Date.now() >= entry.until) {
    attempts.delete(key);
    return;
  }
  if (entry.count >= LOCK_AFTER) {
    const mins = Math.ceil((entry.until - Date.now()) / 60000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    });
  }
}

function recordFailure(key: string) {
  const entry = attempts.get(key) ?? { count: 0, until: 0 };
  entry.count += 1;
  entry.until = Date.now() + LOCK_MS;
  attempts.set(key, entry);
}

function setSessionCookie(headers: Headers, resHeaders: Headers, token: string, maxAge: number) {
  const opts = getSessionCookieOptions(headers);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge,
    }),
  );
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const username = input.username.trim().toLowerCase();
      checkLock(username);

      const rows = await getDb().select().from(users).where(eq(users.username, username)).limit(1);
      const user = rows.at(0);

      // Always run the comparison, even when there's no such user, so response
      // timing doesn't reveal which usernames exist.
      const ok = await verifyPassword(input.password, user?.passwordHash ?? null);

      if (!user || !ok) {
        recordFailure(username);
        // One message for both cases — never leak which half was wrong.
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password" });
      }

      attempts.delete(username);
      await getDb().update(users).set({ lastSignInAt: new Date() }).where(eq(users.id, user.id));

      const token = await signSessionToken({ userId: user.id });
      setSessionCookie(ctx.req.headers, ctx.resHeaders, token, Session.maxAgeMs / 1000);

      return { id: user.id, username: user.username, name: user.name, role: user.role };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    setSessionCookie(ctx.req.headers, ctx.resHeaders, "", 0);
    return { success: true };
  }),
});
