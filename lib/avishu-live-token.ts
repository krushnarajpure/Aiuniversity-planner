import { createHmac, timingSafeEqual } from "crypto";

export type AvishuLiveClaims = {
  sub: string;
  conversationId: string;
  exp: number;
  aud: "avishu-live";
};

function secret() {
  const value = process.env.AVISHU_LIVE_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("AVISHU_LIVE_TOKEN_SECRET or NEXTAUTH_SECRET is required.");
  return value;
}

function encode(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function createAvishuLiveToken(userId: string, conversationId: string, ttlSeconds = 300) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const payload = encode({ sub: userId, conversationId, exp: Math.floor(Date.now() / 1000) + ttlSeconds, aud: "avishu-live" satisfies AvishuLiveClaims["aud"] });
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyAvishuLiveToken(token: string): AvishuLiveClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = sign(`${header}.${payload}`);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AvishuLiveClaims;
    if (claims.aud !== "avishu-live" || !claims.sub || !claims.conversationId || claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
