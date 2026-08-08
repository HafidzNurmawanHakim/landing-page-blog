"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Car, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageImage } from "@/components/package/package-image";
import { TransportBookingDialog } from "@/components/transport/transport-booking-dialog";
import type { ReusableModalRef } from "@/components/ui/modal-drawer";
import type { LocalizedTransportProduct } from "@/lib/db/repositories/transport";
import { formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function TransportDetailView({
  product,
}: {
  product: LocalizedTransportProduct;
}) {
  const { t } = useI18n();
  const bookingRef = useRef<ReusableModalRef>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    product.pricingPackages[0]?.id ?? null,
  );
  const [selectedExtraIds, setSelectedExtraIds] = useState<number[]>([]);

  const galleryImages = useMemo(() => {
    const images =
      product.featuredImage != null && product.featuredImage !== ""
        ? [product.featuredImage, ...product.images]
        : product.images;
    return images.length > 0 ? images : [product.featuredImage || ""];
  }, [product.featuredImage, product.images]);

  const selectedPackage =
    product.pricingPackages.find((p) => p.id === selectedPackageId) ?? null;
  const selectedExtras = product.extraCharges.filter((e) =>
    selectedExtraIds.includes(e.id),
  );

  const total = useMemo(() => {
    if (!selectedPackage) return null;
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return {
      value: selectedPackage.price + extrasTotal,
      currency: selectedPackage.currency,
    };
  }, [selectedPackage, selectedExtras]);

  function toggleExtra(id: number) {
    setSelectedExtraIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/transport"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("transport.back")}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Main content */}
        <div className="space-y-8">
          <Gallery
            images={galleryImages}
            title={product.title}
            caption={t("transport.gallery")}
          />

          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full px-3.5 py-1 text-xs font-medium"
              >
                {product.category}
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {product.capacity} {product.capacityUnit}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {product.description}
              </p>
            )}

            {product.includedServices.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                {product.includedServices.map((service) => (
                  <Badge
                    key={service}
                    variant="outline"
                    className="rounded-full px-3 py-1 text-xs"
                  >
                    {t(`transport.${serviceLabelKey(service)}`)}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Pricing packages */}
          <Card className="rounded-3xl bg-gray-50 dark:bg-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                {t("transport.pricingPackages")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.pricingPackages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("transport.noPackages")}
                </p>
              ) : (
                product.pricingPackages.map((pkg) => {
                  const active = pkg.id === selectedPackageId;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      aria-pressed={active}
                      className={cn(
                        "w-full rounded-3xl border p-4 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-transparent bg-white dark:bg-background hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {pkg.name}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t(`transport.${pkg.type.toLowerCase()}`)}
                            {pkg.durationHours
                              ? ` · ${pkg.durationHours} ${t("transport.hours")}`
                              : ""}
                          </p>
                          {pkg.coveredAreas.length > 0 && (
                            <p className="mt-1 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {pkg.coveredAreas.join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(pkg.price, pkg.currency)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Extra charges */}
          {product.extraCharges.length > 0 && (
            <Card className="rounded-3xl bg-gray-50 dark:bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold tracking-tight">
                  {t("transport.extraCharges")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.extraCharges.map((extra) => {
                  const active = selectedExtraIds.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-3xl border p-4 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-transparent bg-white dark:bg-background hover:bg-muted/60",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {extra.name}
                        </p>
                        {extra.unit && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {extra.unit}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-foreground">
                        +{formatCurrency(extra.price, extra.currency)}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sticky booking sidebar */}
        <aside className="lg:sticky lg:top-24">
          <Card className="rounded-3xl border border-gray-100 dark:border-gray-900">
            <CardContent className="p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("transport.priceEstimate")}
              </span>
              {total ? (
                <div className="mt-1 flex items-baseline gap-1">
                  <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {formatCurrency(total.value, total.currency)}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("transport.selectPackage")}
                </p>
              )}

              {selectedExtras.length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {selectedExtras.map((extra) => (
                    <li key={extra.id} className="flex justify-between gap-3">
                      <span>{extra.name}</span>
                      <span>
                        +{formatCurrency(extra.price, extra.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="my-6 h-px bg-border/60" />

              <Button
                size="lg"
                className="h-12 w-full rounded-full text-base font-semibold shadow-sm"
                disabled={!selectedPackage}
                onClick={() => bookingRef.current?.open()}
              >
                <Clock className="mr-2 h-4 w-4" />
                {t("transport.bookNow")}
              </Button>

              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                {t("transport.waNote")}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      {selectedPackage && (
        <TransportBookingDialog
          ref={bookingRef}
          product={product}
          selectedPackage={selectedPackage}
          selectedExtras={selectedExtras}
        />
      )}
    </main>
  );
}

function serviceLabelKey(service: string): string {
  switch (service) {
    case "DRIVER_AND_GUIDE":
      return "driverAndGuide";
    case "SELF_DRIVE":
      return "selfDrive";
    default:
      return "driverOnly";
  }
}

function Gallery({
  images,
  title,
  caption,
}: {
  images: string[];
  title: string;
  caption?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      {caption && (
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{caption}</h2>
      )}

      <div className="grid gap-3 lg:grid-cols-[1fr_96px] lg:items-start">
        <div className="relative overflow-hidden rounded-3xl">
          <PackageImage
            src={images[activeIndex] || ""}
            alt={`${title} ${activeIndex + 1}`}
            className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105 md:h-[420px]"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 px-1 pt-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {images.map((src, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${title} ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:size-24",
                index === activeIndex
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <PackageImage
                src={src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
