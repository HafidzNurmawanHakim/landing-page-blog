"use client";
import { ChevronDown, Menu, X } from "lucide-react";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { ToggleTheme } from "./toogle-theme";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { useI18n } from "@/lib/i18n/provider";
import { siteConfig } from "@/lib/config/site";
import { cn } from "@/lib/utils";

interface RouteProps {
  href: string;
  labelKey: string;
}

type TFunc = (key: string) => string;

const LINK_CLASSES =
  "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent";

/**
 * Popover that groups a set of same-type nav links (docs/12-design-rules.md:
 * dropdown = rounded-2xl + shadow-md, borderless, hover:bg-accent items).
 */
const NavPopover = forwardRef<
  HTMLButtonElement,
  {
    routes: RouteProps[];
    t: TFunc;
    triggerLabel: string;
    icon?: boolean;
    align?: "start" | "end";
    className?: string;
  }
>(function NavPopover(
  { routes, t, triggerLabel, icon = false, align = "start", className },
  ref
) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={triggerLabel}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
            className
          )}
        >
          {icon && <Menu className="h-4 w-4" />}
          {triggerLabel}
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className="w-56 rounded-2xl border-0 p-1.5 shadow-md"
      >
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className="flex w-full items-center rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t(route.labelKey)}
          </Link>
        ))}
      </PopoverContent>
    </Popover>
  );
});

/**
 * Desktop nav links. Renders as many links as fit in the available width and
 * automatically moves the overflow into a "Lainnya" popover, so the bar never
 * overflows/breaks at any width (see components/layout/navbar.tsx).
 */
function DesktopNav({
  routes,
  t,
}: {
  routes: RouteProps[];
  t: TFunc;
}) {
  const navRef = useRef<HTMLElement>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [visibleCount, setVisibleCount] = useState(routes.length);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav || nav.clientWidth === 0) return; // not visible (mobile/tablet)
    const moreWidth = moreRef.current?.offsetWidth ?? 0;
    const gap = 4; // gap-1
    let acc = 0;
    let count = 0;
    const spans = measureRefs.current;
    for (let i = 0; i < spans.length; i++) {
      const width = spans[i]?.offsetWidth ?? 0;
      if (acc + width <= nav.clientWidth - moreWidth) {
        acc += width + gap;
        count++;
      } else {
        break;
      }
    }
    setVisibleCount((prev) => (prev === count ? prev : count));
    setReady(true);
  }, []);

  useEffect(() => {
    measure();
    const nav = navRef.current;
    const observer = nav ? new ResizeObserver(measure) : null;
    if (nav && observer) observer.observe(nav);
    window.addEventListener("resize", measure);
    let raf = 0;
    document.fonts?.ready?.then(() => {
      raf = requestAnimationFrame(measure);
    });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(raf);
    };
  }, [measure]);

  // Re-measure once the "Lainnya" trigger mounts/unmounts (its width counts too).
  useEffect(() => {
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [visibleCount, measure]);

  return (
    <nav
      ref={navRef}
      aria-label={t("nav.mainNav")}
      className={cn(
        "hidden min-w-0 flex-1 items-center gap-1 lg:flex",
        !ready && "invisible"
      )}
    >
      {routes.slice(0, visibleCount).map((route) => (
        <Link key={route.href} href={route.href} className={LINK_CLASSES}>
          {t(route.labelKey)}
        </Link>
      ))}
      {visibleCount < routes.length && (
        <NavPopover
          ref={moreRef}
          routes={routes.slice(visibleCount)}
          t={t}
          triggerLabel={t("nav.more")}
          align="start"
        />
      )}

      {/* Invisible measuring copy so real link widths are known at every size. */}
      <div
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex items-center gap-1"
      >
        {routes.map((route, index) => (
          <span
            key={route.href}
            ref={(el) => {
              measureRefs.current[index] = el;
            }}
            className={LINK_CLASSES}
          >
            {t(route.labelKey)}
          </span>
        ))}
      </div>
    </nav>
  );
}

export const Navbar = () => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const routeList: RouteProps[] = siteConfig.links.nav;

  return (
    <header className="bg-card/80 backdrop-blur w-[94%] md:w-[80%] lg:max-w-screen-xl top-5 mx-auto sticky z-40 rounded-2xl flex items-center gap-2 p-2 pl-4">
      <Logo size="lg" className="shrink-0" />

      {/* Desktop: inline links + overflow popover (lg+) */}
      <DesktopNav routes={routeList} t={t} />

      {/* Right controls: tablet menu popover + lang/theme + CTA, mobile lang + sheet */}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {/* Tablet (md–lg): all links grouped in one popover to stay tidy */}
        <NavPopover
          routes={routeList}
          t={t}
          triggerLabel={t("nav.menu")}
          icon
          align="end"
          className="hidden md:inline-flex lg:hidden"
        />
        <div className="hidden items-center gap-1 md:flex">
          <LanguageSwitcher />
          <ToggleTheme compact />
        </div>
        <Button
          asChild
          size="sm"
          className="hidden rounded-full md:inline-flex"
        >
          <Link href="/packages">{t("nav.bookNow")}</Link>
        </Button>

        {/* Mobile (< md): language + hamburger sheet */}
        <div className="flex items-center gap-1 md:hidden">
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
      </div>
    </header>
  );
};
