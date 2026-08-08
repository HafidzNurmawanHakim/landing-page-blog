"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { useI18n } from "@/lib/i18n/provider";

const stats = [
  { valueKey: "about.stats.y1.value", labelKey: "about.stats.y1.label" },
  { valueKey: "about.stats.y2.value", labelKey: "about.stats.y2.label" },
  { valueKey: "about.stats.y3.value", labelKey: "about.stats.y3.label" },
  { valueKey: "about.stats.y4.value", labelKey: "about.stats.y4.label" },
] as const;

export function HeroSection() {
  const { t } = useI18n();

  return (
    <div className="px-4 pt-10">
      <section className="relative w-full overflow-hidden rounded-3xl bg-background min-h-[82vh] sm:min-h-[80vh]">
        {/* Background Image */}
        <Image
          src={
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=100&w=2940"
          }
          alt={t("hero.imageAlt") || "Batam tour"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Readability Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />

        {/* Content Overlay */}
        <div className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 pb-40 text-center md:pb-36">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-md sm:text-sm">
                <MapPin className="h-4 w-4" />
                {t("hero.badge") || "Batam, Riau Islands"}
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl lg:leading-[1.1]">
              {t("hero.title1") || "Trip to Batam,"}{" "}
              <span className="text-primary drop-shadow-md">
                {t("hero.title2") || "as easy as booking"}
              </span>
            </h1>

            {/* Subtitle / Description */}
            <p className="mx-auto max-w-2xl text-base font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-lg lg:text-xl">
              {t("hero.subtitle") ||
                "Choose a Tour, Transport, or Hotel package. Book online in minutes with fast WhatsApp confirmation."}
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="group rounded-full px-7 font-semibold shadow-lg"
              >
                <Link href="/packages">
                  {t("hero.bookNow") || "Book Now"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full border-white/40 bg-black/40 px-7 text-white shadow-md backdrop-blur-md hover:bg-black/60 hover:text-white"
              >
                <Link href="/#packages">
                  {t("hero.seePackages") || "See Packages"}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute inset-x-4 bottom-4 z-10 sm:inset-x-8 md:bottom-8">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-y-5 rounded-2xl bg-white/10 px-4 py-5 backdrop-blur-md md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-white/10 md:rounded-full md:px-2 md:py-6">
            {stats.map(({ valueKey, labelKey }) => (
              <div key={valueKey} className="px-2 text-center md:px-4">
                <CountUp
                  value={t(valueKey)}
                  className="text-2xl font-semibold text-white md:text-3xl"
                />
                <div className="mt-0.5 text-xs text-white/70 md:text-sm">
                  {t(labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
