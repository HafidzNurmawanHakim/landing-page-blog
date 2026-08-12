"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageImage } from "@/components/package/package-image";
import { BookingDialog } from "@/components/booking/booking-dialog";
import type { ReusableModalRef } from "@/components/ui/modal-drawer";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import { localizePackage } from "@/lib/i18n/localize";
import { formatIDR } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";

export function PackageDetailView({ pkg }: { pkg: SerializedPackage }) {
  const { t, locale } = useI18n();
  const bookingRef = useRef<ReusableModalRef>(null);
  const localized = localizePackage(pkg, locale);

  const itinerary = localized.itinerary;
  const includes = localized.includes;
  const excludes = localized.excludes;

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Back Button / Navigation */}
      <div className="mb-6">
        <Link
          href="/packages"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t("packages.back")}
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        {/* Main Content Column */}
        <div className="space-y-8">
          {/* Hero Image Container */}
          <div className="relative overflow-hidden rounded-3xl shadow-sm">
            <PackageImage
              src={localized.imageUrl}
              alt={localized.imageAlt}
              className="h-72 w-full object-cover transition-transform duration-500 hover:scale-105 md:h-[420px]"
            />
          </div>

          {/* Title & Metadata Badges Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {pkg.duration && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {pkg.duration}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {t("hero.badge")}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {localized.name}
            </h1>

            {localized.description && (
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                {localized.description}
              </p>
            )}
          </header>

          {/* Itinerary Section: Google Material Vertical Timeline */}
          <Card className="rounded-3xl bg-gray-50 dark:bg-stone-900">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                {t("packages.itinerary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itinerary.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("packages.itineraryEmpty")}
                </p>
              ) : (
                <div className="relative pl-6 before:absolute before:left-[11px] before:top-3 before:h-[calc(100%-24px)] before:w-0.5 before:bg-border">
                  {itinerary.map((step, index) => (
                    <div key={index} className="relative pb-6 last:pb-0">
                      {/* Timeline Node Icon */}
                      <span className="absolute -left-[23px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-sm ring-4 ring-background">
                        {index + 1}
                      </span>
                      {/* Step Content */}
                      <div className="pl-2 pt-0.5">
                        <p className="text-sm font-medium leading-relaxed text-foreground">
                          {step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Includes & Excludes Grid (Tonal Containers) */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Includes Card */}
            <Card className="rounded-3xl border-emerald-500/20 bg-emerald-500/5 shadow-sm dark:bg-emerald-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  {t("packages.includes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Excludes Card */}
            <Card className="rounded-3xl border-border/50 bg-muted/30 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-muted-foreground">
                  {t("packages.excludes")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {excludes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky Sidebar Booking Card */}
        <aside className="lg:sticky lg:top-8">
          <Card className="rounded-3xl border border-gray-100 dark:border-gray-900">
            <CardContent className="p-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("packages.priceFrom")}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {formatIDR(localized.price)}
                </p>
              </div>

              <div className="my-6 h-px bg-border/60" />

              <Button
                size="lg"
                className="h-12 w-full rounded-full text-base font-semibold shadow-sm"
                onClick={() => bookingRef.current?.open()}
              >
                {t("packages.bookNow")}
              </Button>

              <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
                {t("packages.waNote")}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>

      <BookingDialog ref={bookingRef} pkg={{ code: localized.code, name: localized.name, price: localized.price }} />
    </main>
  );
}
