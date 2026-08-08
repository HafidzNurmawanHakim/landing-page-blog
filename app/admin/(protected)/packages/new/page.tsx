import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PackageForm } from "@/components/admin/package-form";

export const metadata = {
  title: "Tambah Paket - Admin Destitour",
};

export default function NewPackagePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/admin/packages"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar paket
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Tambah Paket</h1>
        <p className="mt-2 text-muted-foreground">
          Buat paket tour, transport, atau hotel baru.
        </p>
      </header>

      <PackageForm mode="create" />
    </div>
  );
}
