"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { deleteBlogCategoryAction } from "@/app/actions/blog";
import type { BlogCategory } from "@/lib/db/schema";
import { localizedFirst } from "@/lib/validations/blog";
import { humanizeError } from "@/lib/utils/errors";

export function BlogCategoryRowActions({ item }: { item: BlogCategory }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
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
    try {
      const result = await deleteBlogCategoryAction(item.id);
      if (!result.success) {
        toast.error(result.message ?? "Gagal menghapus kategori.");
        return;
      }
      toast.success("Kategori berhasil dihapus.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal menghapus kategori."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
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
