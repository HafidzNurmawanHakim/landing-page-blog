"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Calendar,
  Search,
  Compass,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import ClientOnly from "@/components/ui/client-only";

// Unsplash Travel High-Res Images Curation
const DESTINATIONS = [
  {
    id: "1",
    title: "Bali, Indonesia",
    category: "Beach & Tropical",
    rating: "4.9",
    price: "$450",
    src: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    height: 340,
  },
  {
    id: "2",
    title: "Swiss Alps, Switzerland",
    category: "Mountain & Snow",
    rating: "5.0",
    price: "$1,200",
    src: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    height: 380,
  },
  {
    id: "3",
    title: "Kyoto, Japan",
    category: "Culture & Nature",
    rating: "4.8",
    price: "$890",
    src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    height: 320,
  },
  {
    id: "4",
    title: "Santorini, Greece",
    category: "Island & Resort",
    rating: "4.9",
    price: "$950",
    src: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    height: 360,
  },
  {
    id: "5",
    title: "Amalfi Coast, Italy",
    category: "Coastal City",
    rating: "4.7",
    price: "$1,100",
    src: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
    height: 330,
  },
  {
    id: "6",
    title: "Reykjavik, Iceland",
    category: "Adventure & Lights",
    rating: "4.9",
    price: "$1,350",
    src: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80",
    height: 370,
  },
];

export function HeroSection() {
  const { t } = useI18n();
  const [destination, setDestination] = useState("");

  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-20 lg:py-24">
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-2 rounded-full border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md sm:text-sm"
            >
              <Compass className="h-4 w-4 animate-spin-slow text-primary" />
              <span>{t("hero.badge") || "Explore The World Uncharted"}</span>
            </Badge>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl lg:leading-[1.15]">
            {t("hero.title1") || "Discover Your Next"}{" "}
            <span className="text-primary drop-shadow-md">
              {t("hero.title2") || "Extraordinary Journey"}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-lg lg:text-xl">
            {t("hero.subtitle") ||
              "Explore handpicked destination packages, curated luxury stays, and unforgettable adventures tailored just for you."}
          </p>

          {/* Secondary Buttons */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button
              asChild
              className="group rounded-full px-6 text-sm font-medium "
            >
              <Link href="/#packages">
                {t("hero.seePackages") || "Browse all categories"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Destination Cards Gallery (Marquee) */}
      <div className="relative z-10 mt-12 overflow-hidden sm:mt-16">
        <ClientOnly>
          <div
            className="group flex w-max animate-marquee gap-6 py-6 hover:[animation-play-state:paused]"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            {[...DESTINATIONS, ...DESTINATIONS].map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="group/card relative w-[240px] shrink-0 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sm:w-[280px]"
                style={{ height: `${item.height}px` }}
              >
                {/* Background Image */}
                <Image
                  fill
                  src={item.src}
                  alt={item.title}
                  sizes="(max-width: 768px) 240px, 280px"
                  className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover/card:opacity-90" />

                {/* Floating Top Tag */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-foreground backdrop-blur-md">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>

                {/* Card Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-left text-white">
                  <h3 className="text-lg font-bold tracking-tight">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/80">
                    <span>Starting from</span>
                    <span className="text-sm font-extrabold text-white">
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ClientOnly>
      </div>
    </section>
  );
}
