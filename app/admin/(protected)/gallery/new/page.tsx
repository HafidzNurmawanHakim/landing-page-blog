import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata = {
  title: "Tambah Foto - Admin Destitour",
};

export default function NewGalleryItemPage() {
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
        <h1 className="text-3xl font-semibold tracking-tight">Tambah Foto</h1>
        <p className="mt-2 text-muted-foreground">
          Upload foto untuk halaman galeri publik.
        </p>
      </header>

      <GalleryForm mode="create" />
    </div>
  );
}
