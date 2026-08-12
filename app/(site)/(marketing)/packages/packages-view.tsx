"use client";

import { Package } from "lucide-react";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import { useI18n } from "@/lib/i18n/provider";
import { PackageCard } from "@/components/package/package-card";

export function PackagesView({
  packages,
}: {
  packages: SerializedPackage[];
}) {
  const { t } = useI18n();

  return (
    <main className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          {t("packages.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("packages.subtitle")}
        </p>
      </header>

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
            <PackageCard key={pkg.code} pkg={pkg} />
          ))}
        </div>
      )}
    </main>
  );
}
