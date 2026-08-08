"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Pencil, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteTransportProductAction,
  toggleTransportProductActiveAction,
} from "@/app/actions/transport";

type RowProduct = { id: number; isActive: number; title: string };

export function TransportRowActions({ product }: { product: RowProduct }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const displayName = product.title;

  async function handleToggle() {
    setBusy("toggle");
    setError(null);
    try {
      const result = await toggleTransportProductActiveAction(product.id);
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status.");
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
    setError(null);
    try {
      const result = await deleteTransportProductAction(product.id);
      if (!result.success) {
        setError(result.message ?? "Gagal menghapus produk.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
    } finally {
      setBusy(null);
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
