"use client";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { Logo } from "@/components/layout/logo";

export const FooterSection = () => {
  const { t } = useI18n();

  const footerLinks: {
    titleKey: string;
    links: { labelKey: string; href: string }[];
  }[] = [
    {
      titleKey: "footer.packages",
      links: [
        { labelKey: "footer.tour", href: "/packages?category=tour" },
        { labelKey: "footer.transport", href: "/packages?category=transport" },
        { labelKey: "footer.hotel", href: "/packages?category=hotel" },
      ],
    },
    {
      titleKey: "footer.help",
      links: [
        { labelKey: "footer.howToBook", href: "/#faq" },
        { labelKey: "footer.contact", href: "/#contact" },
        { labelKey: "footer.faq", href: "/#faq" },
      ],
    },
    {
      titleKey: "footer.info",
      links: [{ labelKey: "footer.about", href: "/#about" }],
    },
  ];

  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="rounded-3xl bg-card p-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8">
          <div className="col-span-full md:col-span-1">
            <Logo className="justify-start" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
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
          &copy; {new Date().getFullYear()} Destitour. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
};
