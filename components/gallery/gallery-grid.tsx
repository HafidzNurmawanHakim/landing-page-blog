"use client";

import { useState } from "react";
import { Check, Heart, ImageIcon, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import { useI18n } from "@/lib/i18n/provider";
import { pickLocale } from "@/lib/i18n/locales";
import { PackageImage } from "@/components/package/package-image";
import {
  shareGalleryItemAction,
  toggleGalleryLikeAction,
} from "@/app/actions/gallery-reactions";
import { cn } from "@/lib/utils";

export type GalleryReactionMap = Record<
  string,
  { liked: boolean; shared: boolean }
>;

const REACTION_ERRORS: Record<string, string> = {
  rate_limited: "gallery.rateLimit",
  not_found: "gallery.notFound",
};
export function GalleryGrid({
  items,
  reactions = {},
}: {
  items: SerializedGalleryItem[];
  reactions?: GalleryReactionMap;
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
            const state = reactions[item.id];
            return (
              <GalleryCard
                key={item.id}
                item={item}
                caption={caption}
                likedInitial={state?.liked ?? false}
                sharedInitial={state?.shared ?? false}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}

function GalleryCard({
  item,
  caption,
  likedInitial,
  sharedInitial,
}: {
  item: SerializedGalleryItem;
  caption: string;
  likedInitial: boolean;
  sharedInitial: boolean;
}) {
  const { t } = useI18n();
  const [liked, setLiked] = useState(likedInitial);
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);
  const [shared, setShared] = useState(sharedInitial);
  const [shareCount, setShareCount] = useState(item.shareCount ?? 0);
  const [busy, setBusy] = useState(false);

  async function handleLike() {
    if (busy) return;
    setBusy(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    // Optimistic update, reverted on failure (docs/12-design-rules.md: motion).
    setLiked(!prevLiked);
    setLikeCount(Math.max(0, prevCount + (prevLiked ? -1 : 1)));
    try {
      const res = await toggleGalleryLikeAction(item.id);
      if (!res.success) throw new Error(res.error);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "gallery.error"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
      const url = window.location.href;
      let sharedToPlatform = false;

      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title: caption, text: caption, url });
          sharedToPlatform = true;
        } catch {
          // User cancelled the native sheet → don't count, no error toast.
          return;
        }
      } else if (typeof navigator.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(url);
        sharedToPlatform = true;
        toast.success(t("gallery.copied"));
      } else {
        throw new Error("unsupported");
      }

      if (sharedToPlatform) {
        const res = await shareGalleryItemAction(item.id);
        if (!res.success) throw new Error(res.error);
        setShared(true);
        setShareCount(res.shareCount);
      }
    } catch (err) {
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "gallery.error"),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <figure className="group relative aspect-square overflow-hidden rounded-3xl bg-card">
      <PackageImage
        src={item.imageUrl}
        alt={caption}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:via-black/40" />
      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
        {caption && (
          <p className="line-clamp-2 text-sm font-medium drop-shadow-sm">
            {caption}
          </p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={busy}
            aria-pressed={liked}
            aria-label={liked ? t("gallery.liked") : t("gallery.like")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              liked ? "hover:bg-black/50" : "hover:bg-black/60",
            )}
          >
            <Heart
              className={cn("h-4 w-4", liked && "fill-red-500 text-red-500")}
            />
            {likeCount}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={busy}
            aria-pressed={shared}
            aria-label={shared ? t("gallery.shared") : t("gallery.share")}
            className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {shared ? (
              <Check className="h-4 w-4 text-emerald-300" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {shareCount}
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
