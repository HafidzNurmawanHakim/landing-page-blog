import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env, isProd } from "../env";

/**
 * Media storage for product images.
 *
 * - Production (Cloudflare Workers / OpenNext): Cloudflare R2 (S3-compatible).
 *   R2 is object storage, NOT a database — D1 keeps only the public URL.
 * - Local dev (no R2 env vars): files are written to `public/uploads` so the
 *   dev server serves them directly.
 */

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export type MediaInput = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type StoredMedia = {
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
};

export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME &&
      env.R2_PUBLIC_URL
  );
}

function extForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

function r2Client(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

function publicObjectUrl(key: string): string {
  const base = env.R2_PUBLIC_URL!.replace(/\/+$/, "");
  return `${base}/${key}`;
}

export async function storeMedia(
  file: MediaInput
): Promise<StoredMedia> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Tipe file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, atau GIF.");
  }
  if (file.size > MAX_MEDIA_BYTES) {
    throw new Error("Ukuran file maksimal 5 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (isR2Configured()) {
    const key = `packages/${crypto.randomUUID()}.${extForMime(file.type)}`;
    await r2Client().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: bytes,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    return {
      url: publicObjectUrl(key),
      key,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    };
  }

  if (!isProd) {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "public", "uploads");
    fs.mkdirSync(dir, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extForMime(file.type)}`;
    fs.writeFileSync(path.join(dir, filename), bytes);
    return {
      url: `/uploads/${filename}`,
      key: filename,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    };
  }

  throw new Error("R2 belum dikonfigurasi. Atur R2_* di environment production.");
}
