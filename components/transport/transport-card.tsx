"use client";

import Link from "next/link";
import { ArrowRight, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageImage } from "@/components/package/package-image";
import type {
  LocalizedTransportProduct,
  TransportServiceType,
} from "@/lib/db/repositories/transport";
import { formatCurrency, transportCategoryLabel } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";

const SERVICE_TYPE_KEYS: Record<TransportServiceType, string> = {
  DRIVER_ONLY: "transport.driverOnly",
  DRIVER_AND_GUIDE: "transport.driverAndGuide",
  SELF_DRIVE: "transport.selfDrive",
};

export function TransportCard({
  product,
}: {
  product: LocalizedTransportProduct;
}) {
  const { t } = useI18n();

  const priceBadges = [
    ...new Map(
      product.pricingPackages.map((p) => [
        `${p.price}:${p.currency}`,
        { price: p.price, currency: p.currency },
      ]),
    ).values(),
  ].sort((a, b) => a.price - b.price);

  const minPrice = priceBadges[0];
  const otherPrices = priceBadges.slice(1, 3);
  const hiddenCount = Math.max(0, priceBadges.length - 3);

  return (
    <>
      {/* Mobile — full-bleed image card (price di bawah, tidak overlap) */}
      <div className="group relative flex h-[420px] w-full flex-col overflow-hidden rounded-3xl bg-muted sm:hidden">
        <PackageImage
          src={product.featuredImage}
          alt={product.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/60" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
              {transportCategoryLabel(product.category)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 text-white/80" />
              {product.capacity} {product.capacityUnit}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <h3 className="text-xl font-semibold leading-tight text-white">
                {product.title}
              </h3>
              {minPrice && (
                <p className="mt-1 text-sm text-white/80">
                  {t("transport.from")}{" "}
                  <span className="text-2xl font-semibold text-white">
                    {formatCurrency(minPrice.price, minPrice.currency)}
                  </span>
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-white/80 line-clamp-2">
                {product.description}
              </p>
            )}

            <div className="pt-2">
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-white font-medium text-black hover:bg-white/90"
              >
                <Link href={`/transport/${product.slug}`}>
                  {t("packages.seeDetail")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop — horizontal card, from-price badge pinned top-right */}
      <div className="relative hidden rounded-3xl bg-card sm:block">
        <div className="flex p-4">
          <div className="relative aspect-[16/10] w-2/5 shrink-0 overflow-hidden rounded-2xl bg-muted lg:w-[36%]">
            <PackageImage
              src={product.featuredImage}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
            <div className="absolute left-3 top-3">
              <span className="inline-flex rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
                {transportCategoryLabel(product.category)}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-between px-6 py-2 pr-2">
            <div className="space-y-3 sm:pr-24">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                <Users className="h-3.5 w-3.5" />
                {product.capacity} {product.capacityUnit}
              </span>

              <div>
                <h3 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                  {product.title}
                </h3>

                {product.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              {product.includedServices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.includedServices.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      {t(SERVICE_TYPE_KEYS[service])}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-secondary/80 pt-4 sm:mt-4">
              {otherPrices.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {otherPrices.map((p) => (
                    <span
                      key={`${p.price}:${p.currency}`}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {formatCurrency(p.price, p.currency)}
                    </span>
                  ))}
                  {hiddenCount > 0 && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      +{hiddenCount}
                    </span>
                  )}
                </div>
              )}

              <Button
                asChild
                size="default"
                className="rounded-full px-5 font-semibold"
              >
                <Link href={`/transport/${product.slug}`}>
                  {t("packages.seeDetail")}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {minPrice && (
          <div className="absolute right-4 top-4 rounded-full px-4 py-2 text-center ">
            <span className="block text-[11px] font-medium uppercase leading-none tracking-wide text-primary-foreground/80">
              {t("transport.from")}
            </span>
            <span className="mt-1 block text-base font-semibold leading-none">
              {formatCurrency(minPrice.price, minPrice.currency)}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
