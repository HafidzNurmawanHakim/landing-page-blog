"use client";

import { useState } from "react";
import { Check, Heart, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useI18n } from "@/lib/i18n/provider";
import {
  shareBlogPostAction,
  toggleBlogPostLikeAction,
} from "@/app/actions/blog-reactions";
import { cn } from "@/lib/utils";

const REACTION_ERRORS: Record<string, string> = {
  rate_limited: "blog.rateLimit",
  not_found: "blog.notFound",
};

export function BlogReactions({
  postId,
  title,
  url,
  likedInitial = false,
  sharedInitial = false,
  likeCountInitial = 0,
  shareCountInitial = 0,
}: {
  postId: number;
  title: string;
  url: string;
  likedInitial?: boolean;
  sharedInitial?: boolean;
  likeCountInitial?: number;
  shareCountInitial?: number;
}) {
  const { t } = useI18n();
  const [liked, setLiked] = useState(likedInitial);
  const [likeCount, setLikeCount] = useState(likeCountInitial);
  const [shared, setShared] = useState(sharedInitial);
  const [shareCount, setShareCount] = useState(shareCountInitial);
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
      const res = await toggleBlogPostLikeAction(postId);
      if (!res.success) throw new Error(res.error);
      setLiked(res.liked);
      setLikeCount(res.likeCount);
    } catch (err) {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "blog.error")
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
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
        toast.success(t("blog.copied"));
      } else {
        throw new Error("unsupported");
      }

      if (sharedToPlatform) {
        const res = await shareBlogPostAction(postId);
        if (!res.success) throw new Error(res.error);
        setShared(true);
        setShareCount(res.shareCount);
      }
    } catch (err) {
      toast.error(
        t(REACTION_ERRORS[(err as Error).message] ?? "blog.error")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleLike}
        disabled={busy}
        aria-pressed={liked}
        aria-label={liked ? t("blog.liked") : t("blog.like")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          liked
            ? "text-red-500 hover:bg-destructive/10"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <Heart className={cn("h-4 w-4", liked && "fill-red-500 text-red-500")} />
        {likeCount}
      </button>

      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        aria-pressed={shared}
        aria-label={shared ? t("blog.shared") : t("blog.share")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          shared
            ? "text-emerald-600 hover:bg-emerald-500/10"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        {shared ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {shareCount}
      </button>
    </div>
  );
}
