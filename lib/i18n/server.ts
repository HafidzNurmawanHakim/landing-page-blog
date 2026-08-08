import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./locales";

/**
 * Resolve the current locale on the server. The client `I18nProvider` writes
 * this cookie when the user switches language, so SSR, `generateMetadata`, and
 * server components render the same locale as the client (no flash).
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (LOCALES as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
}
