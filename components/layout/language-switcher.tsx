"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const LOCALE_LABELS: Record<Locale, string> = {
  id: "Indonesia",
  ms: "Melayu",
  en: "English",
  zh: "中文",
};

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 rounded-full px-3">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_LABELS[locale]}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-52 p-1.5"
        role="group"
        aria-label={t("nav.chooseLang")}
      >
        {(Object.keys(LOCALE_LABELS) as Locale[]).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
              locale === code
                ? "bg-accent text-accent-foreground"
                : "text-foreground hover:bg-accent",
            )}
          >
            {LOCALE_LABELS[code]}
            {locale === code && <Check className="h-4 w-4" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
