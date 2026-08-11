"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  deletePackageAction,
  togglePackageActiveAction,
} from "@/app/actions/packages";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import { pickLocale } from "@/lib/i18n/locales";
import { humanizeError } from "@/lib/utils/errors";

export function PackageRowActions({ pkg }: { pkg: SerializedPackage }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"toggle" | "delete" | null>(null);
  const displayName = pickLocale(pkg.name);

  async function handleToggle() {
    setBusy("toggle");
    try {
      const result = await togglePackageActiveAction(pkg.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(pkg.isActive === 1 ? "Paket dinonaktifkan." : "Paket diaktifkan.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal mengubah status."));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Hapus paket "${displayName}"? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy("delete");
    try {
      const result = await deletePackageAction(pkg.id);
      if (!result.success) {
        toast.error(result.message ?? "Gagal menghapus paket.");
        return;
      }
      toast.success("Paket berhasil dihapus.");
      router.refresh();
    } catch (err) {
      toast.error(humanizeError(err, "Gagal menghapus paket."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="sm" className="rounded-full">
        <Link href={`/admin/packages/${pkg.id}/edit`}>
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
        {pkg.isActive === 1 ? "Nonaktifkan" : "Aktifkan"}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => void handleDelete()}
        disabled={busy === "delete"}
        aria-label={`Hapus `}
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
