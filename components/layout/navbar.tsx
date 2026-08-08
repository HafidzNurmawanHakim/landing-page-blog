"use client";
import { Menu, X } from "lucide-react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
import { ToggleTheme } from "./toogle-theme";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { useI18n } from "@/lib/i18n/provider";
import { siteConfig } from "@/lib/config/site";

interface RouteProps {
  href: string;
  labelKey: string;
}

export const Navbar = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const routeList: RouteProps[] = siteConfig.links.nav;

  return (
    <header className="bg-card/80 backdrop-blur w-[94%] md:w-[80%] lg:max-w-screen-xl top-5 mx-auto sticky z-40 rounded-2xl flex justify-between items-center p-2">
      <div className="flex items-center gap-2">
        <Logo />

        {/* Desktop */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label={t("nav.mainNav")}
        >
          {routeList.map(({ href, labelKey }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              {t(labelKey)}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile */}
      <div className="flex items-center lg:hidden gap-1">
        <LanguageSwitcher />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              aria-label={t("nav.openMenu")}
              className="rounded-full p-2 transition-colors hover:bg-accent"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, labelKey }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{t(labelKey)}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />
              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-2">
        <LanguageSwitcher />
        <ToggleTheme />
        <Button asChild size="sm" className="rounded-full">
          <Link href="/packages">{t("nav.bookNow")}</Link>
        </Button>
      </div>
    </header>
  );
};
