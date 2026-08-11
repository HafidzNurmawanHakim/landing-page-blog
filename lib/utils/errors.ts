const DEFAULT_FALLBACK = "Terjadi kesalahan tak terduga. Coba lagi.";

const KNOWN_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  {
    pattern:
      /failed to fetch|networkerror|network request failed|load failed|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION/i,
    message: "Koneksi terputus. Periksa internetmu lalu coba lagi.",
  },
  {
    pattern: /abort/i,
    message: "Permintaan dibatalkan. Coba lagi.",
  },
  {
    pattern: /timeout/i,
    message: "Server lambat merespons. Coba lagi beberapa saat lagi.",
  },
];

/**
 * Turn an unknown thrown value into a human-friendly message.
 * Server actions already return friendly messages, so this mainly cleans up
 * raw network/runtime errors and empty messages.
 */
export function humanizeError(err: unknown, fallback?: string): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";
  const trimmed = raw.trim();
  if (!trimmed) return fallback ?? DEFAULT_FALLBACK;

  const known = KNOWN_PATTERNS.find(({ pattern }) => pattern.test(trimmed));
  if (known) return known.message;

  return trimmed;
}
