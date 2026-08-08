import {
  DEFAULT_LOCALE,
  pickLocale,
  pickLocaleList,
  type Locale,
  type LocalizedList,
  type LocalizedString,
} from "./locales";

/**
 * Client-safe localization helper (no server-only imports). Resolves the
 * localized fields of a package row for a given locale, with fallback to the
 * default locale (docs/06-i18n.md).
 */

export type LocalizedFields = {
  name: string;
  description: string;
  imageAlt: string;
  itinerary: string[];
  includes: string[];
  excludes: string[];
};

/** Package row with every localized field resolved to a concrete value. */
export type LocalizedPackage = LocalizedFields & Record<string, unknown>;

type LocalizablePackage = {
  name: LocalizedString | string | null;
  description?: LocalizedString | string | null;
  imageAlt?: LocalizedString | string | null;
  itinerary?: LocalizedList | string[] | null;
  includes?: LocalizedList | string[] | null;
  excludes?: LocalizedList | string[] | null;
  [key: string]: unknown;
};

export function localizePackage<T extends LocalizablePackage>(
  pkg: T,
  locale: Locale = DEFAULT_LOCALE
): T & LocalizedFields {
  return {
    ...pkg,
    name: pickLocale(pkg.name, locale),
    description: pickLocale(pkg.description, locale),
    imageAlt: pickLocale(pkg.imageAlt, locale),
    itinerary: pickLocaleList(pkg.itinerary, locale),
    includes: pickLocaleList(pkg.includes, locale),
    excludes: pickLocaleList(pkg.excludes, locale),
  } as T & LocalizedFields;
}
