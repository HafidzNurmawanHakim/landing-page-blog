"use client";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Logo } from "@/components/layout/logo";
import { siteConfig, pickSiteText } from "@/lib/config/site";

export const FooterSection = () => {
  const { t, locale } = useI18n();

  const footerLinks = siteConfig.links.footer;

  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="rounded-3xl bg-card p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8">
          <div className="col-span-full md:col-span-1">
            <Logo className="justify-start" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {pickSiteText(siteConfig.contact.address, locale)}
              </div>
              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.phoneDisplay}
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {siteConfig.contact.email}
              </a>
            </div>
          </div>

          {footerLinks.map((col) => (
            <div key={col.titleKey} className="flex flex-col gap-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {t(col.titleKey)}
              </h3>
              {col.links.map((link) => (
                <Link
                  key={link.labelKey}
                  href={link.href}
                  className="text-sm text-foreground/80 transition-colors hover:text-primary"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <Separator className="my-8" />
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}.{" "}
          {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
};
