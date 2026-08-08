import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TransportForm } from "@/components/admin/transport-form";

export const metadata = {
  title: "Tambah Produk Transport - Admin Destitour",
};

export default function NewTransportPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/admin/transport"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar transport
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tambah Produk Transport
        </h1>
        <p className="mt-2 text-muted-foreground">
          Buat produk rental kendaraan baru dengan paket harga dan biaya tambahan.
        </p>
      </header>

      <TransportForm mode="create" />
    </div>
  );
}
