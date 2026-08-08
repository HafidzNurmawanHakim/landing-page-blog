"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteTestimonialAction } from "@/app/actions/testimonials";
import type { SerializedTestimonial } from "@/lib/db/repositories/testimonials";
import { pickLocale } from "@/lib/i18n/locales";

export function TestimonialRowActions({
  item,
}: {
  item: SerializedTestimonial;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = pickLocale(item.comment);

  async function handleDelete() {
    if (!window.confirm(`Hapus testimoni "${item.name}"? Tindakan tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await deleteTestimonialAction(item.id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus testimoni.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus testimoni.");
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
        <Link href={`/admin/testimonials/${item.id}/edit`}>
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
        aria-label={`Hapus testimoni ${item.name}`}
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
