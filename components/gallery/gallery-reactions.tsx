"use client";

import { Check, Heart, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export type GalleryReactionState = {
  liked: boolean;
  likeCount: number;
  shared: boolean;
  shareCount: number;
  busy: boolean;
};

export function GalleryReactionButtons({
  state,
  onLike,
  onShare,
  className,
}: {
  state: GalleryReactionState;
  onLike: () => void;
  onShare: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={onLike}
        disabled={state.busy}
        aria-pressed={state.liked}
        aria-label={state.liked ? t("gallery.liked") : t("gallery.like")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          state.liked ? "hover:bg-black/50" : "hover:bg-black/60",
        )}
      >
        <Heart
          className={cn("h-4 w-4", state.liked && "fill-red-500 text-red-500")}
        />
        {state.likeCount}
      </button>
      <button
        type="button"
        onClick={onShare}
        disabled={state.busy}
        aria-pressed={state.shared}
        aria-label={state.shared ? t("gallery.shared") : t("gallery.share")}
        className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {state.shared ? (
          <Check className="h-4 w-4 text-emerald-300" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {state.shareCount}
      </button>
    </div>
  );
}
