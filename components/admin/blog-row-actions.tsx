"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { deleteBlogPostAction } from "@/app/actions/blog";
import type { SerializedBlogPost } from "@/lib/db/repositories/blog";
import { localizedFirst } from "@/lib/validations/blog";
import { humanizeError } from "@/lib/utils/errors";

export function BlogRowActions({ item }: { item: SerializedBlogPost }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const displayTitle = localizedFirst(item.title);

  async function handleDelete() {
    if (!window.confirm(`Hapus artikel "${displayTitle}"? Tindakan tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    try {
      const result = await deleteBlogPostAction(item.id);
      if (!result.success) {
        toast.error(result.message ?? "Gagal menghapus artikel.");
        return;
      }
      toast.success("Artikel berhasil dihapus.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal menghapus artikel."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
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
