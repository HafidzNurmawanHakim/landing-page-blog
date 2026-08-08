import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TransportForm } from "@/components/admin/transport-form";
import { getTransportProductById } from "@/lib/db/repositories/transport";
import { pickLocale } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Edit Transport #${id} - Admin Destitour` };
}

export default async function EditTransportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) notFound();

  const product = await getTransportProductById(productId);
  if (!product) notFound();

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
          Edit {pickLocale(product.title)}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ubah detail produk, paket harga, dan biaya tambahan.
        </p>
      </header>

      <TransportForm product={product} mode="edit" />
    </div>
  );
}
