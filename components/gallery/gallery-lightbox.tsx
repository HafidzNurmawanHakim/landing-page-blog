"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import { useI18n } from "@/lib/i18n/provider";
import {
  GalleryReactionButtons,
  type GalleryReactionState,
} from "./gallery-reactions";

export function GalleryLightbox({
  items,
  captions,
  activeIndex,
  onClose,
  onNavigate,
  states,
  onLike,
  onShare,
}: {
  items: SerializedGalleryItem[];
  captions: string[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  states: Record<number, GalleryReactionState>;
  onLike: (itemId: number) => void;
  onShare: (itemId: number) => void;
}) {
  const { t } = useI18n();
  const open = activeIndex !== null && items.length > 0;
  const index = activeIndex ?? 0;
  const item = items[index];
  const caption = captions[index] ?? "";
  const state = item ? states[item.id] : undefined;

  const goTo = useCallback(
    (dir: 1 | -1) => {
      onNavigate((index + dir + items.length) % items.length);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(1);
      if (e.key === "ArrowLeft") goTo(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, goTo]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-3xl p-0">
        <DialogTitle className="sr-only">
          {caption || t("gallery.title")}
        </DialogTitle>
        <div className="relative bg-secondary">
          <div className="relative h-[55vh] sm:h-[70vh]">
            {item && (
              <Image
                src={item.imageUrl}
                alt={caption || t("gallery.title")}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
                priority
              />
            )}
          </div>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => goTo(-1)}
              aria-label={t("gallery.previous")}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => goTo(1)}
              aria-label={t("gallery.next")}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
          {items.length > 1 && (
            <div className="absolute left-3 top-3 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {index + 1} / {items.length}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-4 p-5">
          {caption && (
            <p className="text-center text-sm font-medium">{caption}</p>
          )}
          {item && state && (
            <GalleryReactionButtons
              state={state}
              onLike={() => onLike(item.id)}
              onShare={() => onShare(item.id)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
