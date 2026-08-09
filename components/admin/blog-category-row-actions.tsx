"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBlogCategoryAction } from "@/app/actions/blog";
import type { BlogCategory } from "@/lib/db/schema";
import { localizedFirst } from "@/lib/validations/blog";

export function BlogCategoryRowActions({ item }: { item: BlogCategory }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const displayName = localizedFirst(item.name);

  async function handleDelete() {
    if (
      !window.confirm(
        `Hapus kategori "${displayName}"? Kategori yang masih dipakai artikel tidak bisa dihapus.`
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await deleteBlogCategoryAction(item.id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus kategori.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori.");
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
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => void handleDelete()}
        disabled={busy}
        aria-label={`Hapus kategori ${displayName}`}
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
