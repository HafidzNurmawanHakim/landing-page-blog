"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export const ToggleTheme = ({ compact = false }: { compact?: boolean }) => {
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();
  return (
    <Button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      size={compact ? "icon" : "sm"}
      variant="ghost"
      className={compact ? "rounded-full" : "w-full justify-start"}
    >
      <div className="flex gap-2 dark:hidden">
        <Moon className="size-5" />
        {!compact && <span className="block lg:hidden">{t("nav.themeDark")}</span>}
      </div>

      <div className="hidden gap-2 dark:flex">
        <Sun className="size-5" />
        {!compact && <span className="block lg:hidden">{t("nav.themeLight")}</span>}
      </div>

      <span className="sr-only">{t("nav.switchTheme")}</span>
    </Button>
  );
};
