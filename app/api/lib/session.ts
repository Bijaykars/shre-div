import * as jose from "jose";
import { env } from "./env";

const JWT_ALG = "HS256";

export type SessionPayload = { userId: number };

// Fail loudly at startup rather than deep inside jose at sign time. An empty or
// trivially short secret means forgeable admin sessions.
function secretKey() {
  if (env.sessionSecret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to at least 32 characters. Generate one with:\n" +
        `  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
    );
  }
  return new TextEncoder().encode(env.sessionSecret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = secretKey();
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, secretKey(), { algorithms: [JWT_ALG] });
    const userId = payload.userId;
    return typeof userId === "number" ? { userId } : null;
  } catch {
    // Expired or tampered token — treat as signed out.
    return null;
  }
}
