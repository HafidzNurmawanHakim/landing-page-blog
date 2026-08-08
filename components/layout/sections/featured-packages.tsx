"use client";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/package/package-card";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import { useI18n } from "@/lib/i18n/provider";

const FILTERS = ["all", "tour", "transport", "hotel"] as const;

export function FeaturedPackages({
  packages,
}: {
  packages: SerializedPackage[];
}) {
  const { t } = useI18n();

  return (
    <section id="packages" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        {t("services.title")}
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        {t("services.heading")}
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-10">
        {t("services.desc")}
      </h3>

      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {FILTERS.map((value) => (
          <Link
            key={value}
            href={value === "all" ? "/packages" : `/packages?category=${value}`}
            className="rounded-full bg-secondary px-5 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
          >
            {value === "all" ? t("common.all") : t(`common.${value}`)}
          </Link>
        ))}
      </div>

      {packages.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t("packages.emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("packages.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/packages">
            {t("featured.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
