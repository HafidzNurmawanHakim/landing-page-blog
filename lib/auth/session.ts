import { cookies } from "next/headers";
import { env } from "../env";
import { getAdminByEmail } from "../db/repositories/admins";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type AdminSession = {
  email: string;
  name: string | null;
  expiresAt: number;
};

function bufferToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function encodePayload(payload: AdminSession): string {
  return bufferToBase64(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodePayload(b64: string): AdminSession | null {
  try {
    return JSON.parse(
      new TextDecoder().decode(base64ToBytes(b64))
    ) as AdminSession;
  } catch {
    return null;
  }
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.AUTH_SECRET) as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a payload with HMAC-SHA256 (WebCrypto, works on edge + node).
 * Format: `payloadB64.signatureB64`.
 */
export async function createSessionToken(session: AdminSession): Promise<string> {
  const payloadB64 = encodePayload(session);
  const key = await hmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payloadB64) as BufferSource
  );
  return `${payloadB64}.${bufferToBase64(signature)}`;
}

async function verifyToken(token: string): Promise<AdminSession | null> {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const payloadB64 = token.slice(0, dot);
  const signatureB64 = token.slice(dot + 1);

  const key = await hmacKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64ToBytes(signatureB64) as BufferSource,
    new TextEncoder().encode(payloadB64) as BufferSource
  );

  if (!valid) return null;

  const payload = decodePayload(payloadB64);
  if (!payload || typeof payload.email !== "string") return null;

  return payload;
}

export async function createSession(
  email: string,
  name: string | null
): Promise<void> {
  const session: AdminSession = {
    email,
    name,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await createSessionToken(session);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (!session) return null;

  if (session.expiresAt < Math.floor(Date.now() / 1000)) return null;

  return session;
}

/**
 * Returns the session if valid AND the admin still exists in the DB
 * (handles the case where an admin account was removed).
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await getSession();
  if (!session) return null;

  const admin = await getAdminByEmail(session.email);
  if (!admin) return null;

  return session;
}
