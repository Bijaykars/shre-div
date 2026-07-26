/**
 * Creates an admin, or resets an existing admin's password.
 *
 *   npx tsx scripts/set-admin.ts <username> <password>
 *
 * Run it on the server to hand the shop owner their login. The password is
 * only ever stored as a scrypt hash.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { hashPassword, MIN_PASSWORD_LENGTH } from "../api/lib/password";
import { users } from "../db/schema";

const [rawUsername, password] = process.argv.slice(2);

if (!rawUsername || !password) {
  console.error("Usage: npx tsx scripts/set-admin.ts <username> <password>");
  process.exit(1);
}
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

const username = rawUsername.trim().toLowerCase();
const db = getDb();
const passwordHash = await hashPassword(password);

const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);

if (existing.length) {
  await db.update(users).set({ passwordHash, role: "admin" }).where(eq(users.username, username));
  console.log(`Password reset for admin "${username}".`);
} else {
  await db.insert(users).values({ username, passwordHash, name: rawUsername.trim(), role: "admin" });
  console.log(`Admin "${username}" created.`);
}

console.log("Sign in at /login");
process.exit(0);
