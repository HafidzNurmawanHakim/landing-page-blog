"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

const CARD_HEIGHT = 320;

const FLOATING_IMAGES = [
  {
    src: "/img/plane.webp",
    className: "top-8 left-4 w-12 rotate-[-12deg] sm:left-32 sm:w-16",
    mobile: true,
  },
  {
    src: "/img/globe.webp",
    className: "top-12 right-6 w-16 rotate-[15deg] sm:right-24 sm:w-32",
    mobile: false,
  },
  {
    src: "/img/compass.webp",
    className:
      "top-1/3 left-4 w-14 -translate-y-1/2 rotate-[-8deg] sm:left-48 sm:w-20",
    mobile: false,
  },
  {
    src: "/img/location.webp",
    className:
      "top-1/2 right-4 w-12 -translate-y-1/2 rotate-[12deg] sm:right-1/3 sm:w-14",
    mobile: true,
  },
  {
    src: "/img/backpack.webp",
    className: "bottom-72 left-8 w-14 rotate-[10deg] sm:left-20 sm:w-16",
    mobile: true,
  },
  {
    src: "/img/suitcase.webp",
    className: "right-8 sm:bottom-1/2 w-14 rotate-[-15deg] sm:right-24 sm:w-16",
    mobile: true,
  },
];

const TRAVEL_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    alt: "Beach",
  },
  {
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80",
    alt: "Mountain",
  },
  {
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80",
    alt: "Lake",
  },
  {
    src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=600&q=80",
    alt: "Airplane",
  },
  {
    src: "https://images.unsplash.com/photo-1471970471555-19d4b113e9ed?auto=format&fit=crop&w=600&q=80",
    alt: "City",
  },
  {
    src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=600&q=80",
    alt: "Nature",
  },
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function FloatingDecoration() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {FLOATING_IMAGES.map((image, index) => (
        <div
          key={image.src}
          className={cn(
            "animate-float absolute select-none opacity-80 drop-shadow-xl",
            image.className,
            !image.mobile && "hidden lg:block",
          )}
          style={{
            animationDelay: `${index * 0.4}s`,
          }}
        >
          <Image
            src={image.src}
            alt=""
            width={100}
            height={100}
            className="h-auto w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}

export function HeroSection() {
  const { t } = useI18n();

  const slides = React.useMemo(
    () =>
      TRAVEL_IMAGES.map((image) => ({
        ...image,
        width: rand(180, 280),
        offsetY: rand(-28, 28),
      })),
    [],
  );

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      <div className="absolute h-[80vh] w-screen top-0 left-0 z-0">
        <FloatingDecoration />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium"
          >
            <MapPin className="mr-2 h-4 w-4 text-primary" />
            {t("hero.badge")}
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            {t("hero.title1")}{" "}
            <span className="text-primary">{t("hero.title2")}</span>
          </h1>

          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group w-full rounded-full px-8 sm:w-auto"
            >
              <Link href="/packages">
                {t("hero.bookNow")}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              variant="secondary"
              size="lg"
              className="w-full rounded-full px-8 sm:w-auto"
            >
              <Link href="/#packages">{t("hero.seePackages")}</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-16 overflow-hidden md:mt-24">
        <div
          className="group flex w-max animate-marquee gap-6 py-8 hover:[animation-play-state:paused]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          {[...slides, ...slides].map((image, i) => (
            <div
              key={`${image.src}-${i}`}
              className="group/card relative overflow-hidden rounded-3xl shadow-lg transition-transform duration-300 hover:scale-[1.03]"
              style={{
                width: image.width,
                height: CARD_HEIGHT,
                transform: `translateY(${image.offsetY}px)`,
              }}
            >
              <Image
                fill
                src={image.src}
                alt={image.alt}
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                sizes={`${image.width}px`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
