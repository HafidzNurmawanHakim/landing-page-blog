"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PackageImage } from "@/components/package/package-image";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import { localizePackage } from "@/lib/i18n/localize";
import { formatIDR } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";
import ClientOnly from "../ui/client-only";
import { Spinner } from "../ui/spinner";

interface PackageCardProps {
  pkg: SerializedPackage;
}

export function PackageCard({ pkg }: PackageCardProps) {
  const { t, locale } = useI18n();
  const localized = localizePackage(pkg, locale);

  return (
    <div className="group relative flex h-[420px] w-full flex-col overflow-hidden rounded-3xl border-0 bg-muted shadow-none">
      {/* Full Background Image */}
      <PackageImage
        src={localized.imageUrl}
        alt={localized.imageAlt}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Gradient Scrim Overlay for Contrast & Google-Style Clean Look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/60" />

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
        {/* Header: Duration */}
        <div className="flex items-center justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md">
            <Clock className="h-3.5 w-3.5 text-white/80" />
            {pkg.duration}
          </span>
        </div>

        {/* Bottom Content Container */}
        <div className="flex flex-col gap-3 transition-all duration-300">
          <div>
            <h3 className="text-xl font-bold leading-tight text-white drop-shadow-sm">
              {localized.name}
            </h3>
            <ClientOnly fallback={<Spinner />}>
              <p className="mt-1 text-2xl font-extrabold text-white">
                {formatIDR(localized.price)}
              </p>
            </ClientOnly>
          </div>

          {/* Description Overlay: Ringkasan saat normal (2 baris), Tampil Penuh saat Hover */}
          {localized.description && (
            <p className="text-sm text-white/80 line-clamp-2 transition-all duration-300 group-hover:line-clamp-none group-hover:text-white">
              {localized.description}
            </p>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Button
              asChild
              className="w-full rounded-full border-0 bg-white font-medium text-black shadow-none transition-all duration-300 hover:bg-white/90"
              size="lg"
            >
              <Link href={`/packages/${pkg.slug}`}>
                {t("packages.seeDetail")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
