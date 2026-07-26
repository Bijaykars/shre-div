import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEYLEN = 64;
export const MIN_PASSWORD_LENGTH = 8;

/** Hashes a password as `salt:key`, both hex. Uses node's scrypt — no dependency. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, KEYLEN);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

/** Constant-time check. Returns false on any malformed stored value rather than throwing. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, "hex");
  if (expected.length !== KEYLEN) return false;

  const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), KEYLEN);
  return timingSafeEqual(actual, expected);
}
