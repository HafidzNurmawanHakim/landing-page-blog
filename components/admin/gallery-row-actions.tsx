"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGalleryItemAction } from "@/app/actions/gallery";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import { pickLocale } from "@/lib/i18n/locales";

export function GalleryRowActions({ item }: { item: SerializedGalleryItem }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const caption = pickLocale(item.caption);

  async function handleDelete() {
    if (!window.confirm(`Hapus gambar ini? Tindakan tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await deleteGalleryItemAction(item.id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus gambar.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus gambar.");
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
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link href={`/admin/gallery/${item.id}/edit`}>
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
        aria-label={caption ? `Hapus ${caption}` : "Hapus gambar"}
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
