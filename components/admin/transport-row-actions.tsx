"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  deleteTransportProductAction,
  toggleTransportProductActiveAction,
} from "@/app/actions/transport";
import { humanizeError } from "@/lib/utils/errors";

type RowProduct = { id: number; isActive: number; title: string };

export function TransportRowActions({ product }: { product: RowProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const displayName = product.title;

  async function handleToggle() {
    setBusy("toggle");
    try {
      const result = await toggleTransportProductActiveAction(product.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(product.isActive === 1 ? "Produk dinonaktifkan." : "Produk diaktifkan.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal mengubah status."));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Hapus produk "${displayName}"? Semua paket harga dan biaya tambahannya ikut terhapus.`
      )
    ) {
      return;
    }
    setBusy("delete");
    try {
      const result = await deleteTransportProductAction(product.id);
      if (!result.success) {
        toast.error(result.message ?? "Gagal menghapus produk.");
        return;
      }
      toast.success("Produk transport berhasil dihapus.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal menghapus produk."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link href={`/admin/transport/${product.id}/edit`}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="rounded-full"
        onClick={() => void handleToggle()}
        disabled={busy === "toggle"}
      >
        {busy === "toggle" ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Power className="mr-1.5 h-3.5 w-3.5" />
        )}
        {product.isActive === 1 ? "Nonaktifkan" : "Aktifkan"}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => void handleDelete()}
        disabled={busy === "delete"}
        aria-label="Hapus produk"
      >
        {busy === "delete" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
