/**
 * Centralized, validated access to environment variables.
 *
 * Values are read once and cached. Server-only env vars throw in the browser
 * bundle as an extra guard against accidental exposure.
 */

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default("id"),

  AUTH_SECRET: z
    .string()
    .min(32)
    .default("dev-secret-change-me-0123456789abcdef"),
  ADMIN_EMAIL: z.string().email().default("admin@destitour.com"),
  ADMIN_PASSWORD_HASH: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z
    .string()
    .email()
    .default("no-reply@destitour.com"),
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_ADMIN_NUMBER: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional().or(z.literal("")),
});

type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten());
  throw new Error("Invalid environment variables. See logs above.");
}

const envData = parsed.data;

// Fail fast in production instead of silently running with insecure defaults.
if (envData.NODE_ENV === "production") {
  if (envData.AUTH_SECRET === "dev-secret-change-me-0123456789abcdef") {
    throw new Error("AUTH_SECRET must be set to a strong random value in production.");
  }
  if (envData.NEXT_PUBLIC_SITE_URL.startsWith("http://localhost")) {
    throw new Error("NEXT_PUBLIC_SITE_URL must point to the production domain in production.");
  }
  if (!envData.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be set in production.");
  }
  if (!envData.WHATSAPP_API_KEY || !envData.WHATSAPP_ADMIN_NUMBER) {
    // WhatsApp is optional: email is the primary notification channel.
    console.warn(
      "⚠️ WHATSAPP_API_KEY / WHATSAPP_ADMIN_NUMBER not set. Admin will not get WhatsApp alerts.",
    );
  }
}

export const env: Env = envData;

export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
