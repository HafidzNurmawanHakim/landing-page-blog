"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { deleteTestimonialAction } from "@/app/actions/testimonials";
import type { SerializedTestimonial } from "@/lib/db/repositories/testimonials";
import { pickLocale } from "@/lib/i18n/locales";
import { humanizeError } from "@/lib/utils/errors";

export function TestimonialRowActions({
  item,
}: {
  item: SerializedTestimonial;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const preview = pickLocale(item.comment);

  async function handleDelete() {
    if (!window.confirm(`Hapus testimoni "${item.name}"? Tindakan tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    try {
      const result = await deleteTestimonialAction(item.id);
      if (!result.success) {
        toast.error(result.message ?? "Gagal menghapus testimoni.");
        return;
      }
      toast.success("Testimoni berhasil dihapus.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal menghapus testimoni."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
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
