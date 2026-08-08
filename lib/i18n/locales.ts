export const LOCALES = ["id", "ms", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

/** Cookie key the provider writes so server components can read the locale. */
export const LOCALE_COOKIE = "locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  id: "Indonesia",
  ms: "Melayu",
  en: "English",
  zh: "中文",
};

/**
 * Localized content shape stored per-field in the DB (docs/06-i18n.md).
 * Every locale is optional; resolution falls back to the default locale.
 */
export type LocalizedString = Partial<Record<Locale, string>>;
export type LocalizedList = Partial<Record<Locale, string[]>>;

function resolveLocaleOrder(
  locale: Locale,
  fallback: Locale = DEFAULT_LOCALE
): Locale[] {
  const order = [locale, fallback, ...LOCALES];
  return [...new Set(order)];
}

/**
 * Resolve a localized string. Accepts the localized object or a legacy
 * plain-string value (pre-migration rows) and returns it untouched.
 */
export function pickLocale(
  value: LocalizedString | string | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
  fallback: Locale = DEFAULT_LOCALE
): string {
  if (typeof value === "string") return value;
  if (!value) return "";
  for (const code of resolveLocaleOrder(locale, fallback)) {
    const candidate = value[code];
    if (candidate && candidate.trim()) return candidate;
  }
  return "";
}

/**
 * Resolve a localized list. Accepts the localized object or a legacy
 * plain array (pre-migration rows) and returns it untouched.
 */
export function pickLocaleList(
  value: LocalizedList | string[] | null | undefined,
  locale: Locale,
  fallback: Locale = DEFAULT_LOCALE
): string[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  for (const code of resolveLocaleOrder(locale, fallback)) {
    const candidate = value[code];
    if (candidate && candidate.length > 0) return candidate;
  }
  return [];
}
