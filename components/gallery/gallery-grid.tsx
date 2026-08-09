"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import { useI18n } from "@/lib/i18n/provider";
import { pickLocale } from "@/lib/i18n/locales";
import { PackageImage } from "@/components/package/package-image";
import {
  shareGalleryItemAction,
  toggleGalleryLikeAction,
} from "@/app/actions/gallery-reactions";
import { GalleryLightbox } from "./gallery-lightbox";
import {
  GalleryReactionButtons,
  type GalleryReactionState,
} from "./gallery-reactions";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const captions = items.map((item) => pickLocale(item.caption, locale));
  const captionByItemId: Record<number, string> = {};
  items.forEach((item, i) => {
    captionByItemId[item.id] = captions[i];
  });

  // Reaction state is lifted to the grid so the card and the lightbox share
  // the same like/share counts (docs/05-api-server-actions.md).
  const [states, setStates] = useState<Record<number, GalleryReactionState>>(
    () => {
      const map: Record<number, GalleryReactionState> = {};
      for (const item of items) {
        map[item.id] = {
          liked: reactions[item.id]?.liked ?? false,
          likeCount: item.likeCount ?? 0,
          shared: reactions[item.id]?.shared ?? false,
          shareCount: item.shareCount ?? 0,
          busy: false,
        };
      }
      return map;
    },
  );

  async function handleLike(itemId: number) {
    const current = states[itemId];
    if (!current || current.busy) return;
    const prevLiked = current.liked;
    const prevCount = current.likeCount;
    // Optimistic update, reverted on failure (docs/12-design-rules.md: motion).
    setStates((s) => ({
      ...s,
      [itemId]: {
        ...current,
        busy: true,
        liked: !prevLiked,
        likeCount: Math.max(0, prevCount + (prevLiked ? -1 : 1)),
      },
    }));
    try {
      const res = await toggleGalleryLikeAction(itemId);
      if (!res.success) throw new Error(res.error);
      setStates((s) => ({
        ...s,
        [itemId]: { ...s[itemId], liked: res.liked, likeCount: res.likeCount },
      }));
    } catch (err) {
      setStates((s) => ({ ...s, [itemId]: { ...current, busy: false } }));
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "gallery.error"),
      );
      return;
    }
    setStates((s) => ({ ...s, [itemId]: { ...s[itemId], busy: false } }));
  }

  async function handleShare(itemId: number) {
    const current = states[itemId];
    if (!current || current.busy) return;
    setStates((s) => ({ ...s, [itemId]: { ...current, busy: true } }));
    try {
      const url = window.location.href;
      const title = captionByItemId[itemId] ?? "";
      let sharedToPlatform = false;

      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ title, text: title, url });
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
        const res = await shareGalleryItemAction(itemId);
        if (!res.success) throw new Error(res.error);
        setStates((s) => ({
          ...s,
          [itemId]: { ...s[itemId], shared: true, shareCount: res.shareCount },
        }));
      }
    } catch (err) {
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "gallery.error"),
      );
    } finally {
      setStates((s) => ({ ...s, [itemId]: { ...s[itemId], busy: false } }));
    }
  }

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
        <div className="grid grid-cols-2 gap-1 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <GalleryCard
              key={item.id}
              item={item}
              caption={captions[i]}
              state={states[item.id]}
              onLike={() => handleLike(item.id)}
              onShare={() => handleShare(item.id)}
              onOpen={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}

      <GalleryLightbox
        items={items}
        captions={captions}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
        states={states}
        onLike={handleLike}
        onShare={handleShare}
      />
    </main>
  );
}

function GalleryCard({
  item,
  caption,
  state,
  onLike,
  onShare,
  onOpen,
}: {
  item: SerializedGalleryItem;
  caption: string;
  state?: GalleryReactionState;
  onLike: () => void;
  onShare: () => void;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  return (
    <figure className="group relative aspect-square overflow-hidden rounded bg-card md:rounded-xl">
      <PackageImage
        src={item.imageUrl}
        alt={caption}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={t("gallery.viewDetail")}
        className="absolute inset-0 z-[2] cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:via-black/40" />
      <figcaption className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
        {caption && (
          <p className="line-clamp-2 text-sm font-medium drop-shadow-sm">
            {caption}
          </p>
        )}
        {state && (
          <div className="mt-3 flex items-center gap-2">
            <GalleryReactionButtons
              state={state}
              onLike={onLike}
              onShare={onShare}
            />
          </div>
        )}
      </figcaption>
    </figure>
  );
}
