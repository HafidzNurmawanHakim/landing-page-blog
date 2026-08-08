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

export const LOCALES = ["id", "ms", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export type Messages = Record<string, unknown>;

export const DEFAULT_LOCALE: Locale = "id";

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

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem("locale");
    return (LOCALES as readonly string[]).includes(stored ?? "")
      ? (stored as Locale)
      : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Messages>(() =>
    loadMessages(DEFAULT_LOCALE)
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    setMessages(loadMessages(locale));
  }, [locale]);

  useEffect(() => {
    const stored = getInitialLocale();
    if (stored !== DEFAULT_LOCALE) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem("locale", next);
    } catch {
      // ignore: storage unavailable, still switch in-memory
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
