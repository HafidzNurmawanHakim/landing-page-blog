"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import idMessages from "@/messages/id.json";
import msMessages from "@/messages/ms.json";
import enMessages from "@/messages/en.json";
import zhMessages from "@/messages/zh.json";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from "./locales";

export { DEFAULT_LOCALE, LOCALES, type Locale };
export type Messages = Record<string, unknown>;

const messagesMap: Record<Locale, Messages> = {
  id: idMessages,
  ms: msMessages,
  en: enMessages,
  zh: zhMessages,
};

function loadMessages(locale: Locale): Messages {
  return messagesMap[locale] ?? messagesMap[DEFAULT_LOCALE];
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(() =>
    loadMessages(initialLocale)
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    setMessages(loadMessages(locale));
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem("locale", next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
      // ignore: storage/cookie unavailable, still switch in-memory
    }
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const value = key.split(".").reduce<unknown>(
        (acc, part) =>
          acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
        messages
      );
      return typeof value === "string" ? value : key;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n harus dipakai di dalam <I18nProvider>");
  }
  return ctx;
}
