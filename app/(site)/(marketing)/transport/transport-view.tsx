"use client";

import { Car } from "lucide-react";
import type { LocalizedTransportProduct } from "@/lib/db/repositories/transport";
import { useI18n } from "@/lib/i18n/provider";
import { transportCategoryLabel } from "@/lib/utils/format";
import { TransportCard } from "@/components/transport/transport-card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function TransportView({
  products,
  categories,
  selected,
}: {
  products: LocalizedTransportProduct[];
  categories: string[];
  selected: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const query = params.toString();
    router.push(query ? `/transport?${query}` : "/transport");
  }

  return (
    <main className="container py-12">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
          {t("transport.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {t("transport.subtitle")}
        </p>
      </header>

      {/* Filter Chips */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {["all", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => selectCategory(cat)}
              aria-pressed={selected === cat}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200",
                selected === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent",
              )}
            >
              {cat === "all" ? t("common.all") : transportCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Empty State atau Grid Produk */}
      {products.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center shadow-none">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Car className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("transport.emptyTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("transport.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <TransportCard key={product.code} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
