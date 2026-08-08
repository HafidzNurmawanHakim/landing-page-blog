/**
 * Password hashing using WebCrypto PBKDF2-SHA256.
 *
 * WebCrypto is chosen over node:crypto so the code runs identically on
 * Cloudflare Workers (edge runtime) and Node (local dev / OpenNext build).
 *
 * Format stored: `pbkdf2$iterations$saltB64$hashB64`
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // bytes
const SALT_LENGTH = 16; // bytes
const ALGO = "SHA-256";

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
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

function toUint8Array(buf: ArrayBuffer): Uint8Array {
  return new Uint8Array(buf);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: ALGO,
      iterations: ITERATIONS,
      salt: salt as BufferSource,
    },
    keyMaterial,
    KEY_LENGTH * 8
  );

  return [
    "pbkdf2",
    String(ITERATIONS),
    bufferToBase64(salt.buffer as ArrayBuffer),
    bufferToBase64(derived),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    // Unsupported hash format — fail closed.
    return false;
  }

  const [, iterStr, saltB64, hashB64] = parts;
  const iterations = Number(iterStr);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password) as BufferSource,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: ALGO,
      iterations,
      salt: base64ToBytes(saltB64) as BufferSource,
    },
    keyMaterial,
    base64ToBytes(hashB64).length * 8
  );

  return constantTimeEqual(toUint8Array(derived), base64ToBytes(hashB64));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
