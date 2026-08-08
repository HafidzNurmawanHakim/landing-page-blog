import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GalleryForm } from "@/components/admin/gallery-form";
import {
  getGalleryItemById,
  serializeGalleryItem,
} from "@/lib/db/repositories/gallery";

export const metadata = {
  title: "Edit Foto - Admin Destitour",
};

export default async function EditGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) notFound();

  const item = await getGalleryItemById(itemId);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/admin/gallery"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke galeri
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Foto</h1>
        <p className="mt-2 text-muted-foreground">Foto #{item.id}</p>
      </header>

      <GalleryForm item={serializeGalleryItem(item)} mode="edit" />
    </div>
  );
}
