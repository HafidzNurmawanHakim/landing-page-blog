"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBlogPostAction } from "@/app/actions/blog";
import type { SerializedBlogPost } from "@/lib/db/repositories/blog";
import { localizedFirst } from "@/lib/validations/blog";

export function BlogRowActions({ item }: { item: SerializedBlogPost }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayTitle = localizedFirst(item.title);

  async function handleDelete() {
    if (!window.confirm(`Hapus artikel "${displayTitle}"? Tindakan tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await deleteBlogPostAction(item.id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus artikel.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus artikel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {error && (
        <span className="mr-2 inline-flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </span>
      )}
      {item.status === "published" && (
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href={`/blog/${item.slug}`} target="_blank" aria-label="Lihat artikel">
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link href={`/admin/blogs/${item.id}/edit`}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => void handleDelete()}
        disabled={busy}
        aria-label={`Hapus artikel ${displayTitle}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
