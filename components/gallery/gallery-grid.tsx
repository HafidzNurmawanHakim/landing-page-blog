"use client";

import { ImageIcon } from "lucide-react";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import { useI18n } from "@/lib/i18n/provider";
import { pickLocale } from "@/lib/i18n/locales";
import { PackageImage } from "@/components/package/package-image";

export function GalleryGrid({
  items,
}: {
  items: SerializedGalleryItem[];
}) {
  const { t, locale } = useI18n();

  return (
    <main className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          {t("gallery.title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {t("gallery.subtitle")}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <ImageIcon className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t("gallery.emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("gallery.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const caption = pickLocale(item.caption, locale);
            return (
              <figure
                key={item.id}
                className="group overflow-hidden rounded-3xl bg-card"
              >
                <div className="relative aspect-square overflow-hidden">
                  <PackageImage
                    src={item.imageUrl}
                    alt={caption}
                    className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                {caption && (
                  <figcaption className="line-clamp-2 px-4 py-3 text-sm text-foreground/80">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </main>
  );
}
