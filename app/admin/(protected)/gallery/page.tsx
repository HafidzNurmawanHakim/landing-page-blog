import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  listGalleryItems,
  serializeGalleryItem,
} from "@/lib/db/repositories/gallery";
import { pickLocale } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils/format";
import { PackageImage } from "@/components/package/package-image";
import { GalleryRowActions } from "@/components/admin/gallery-row-actions";

export const metadata = {
  title: "Galeri - Admin Destitour",
};

export default async function AdminGalleryPage() {
  const { items, total } = await listGalleryItems({ limit: 100 });
  const gallery = items.map(serializeGalleryItem);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Galeri</h1>
          <p className="mt-2 text-muted-foreground">
            {total} foto terpasang di halaman galeri publik
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/gallery/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Foto
          </Link>
        </Button>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {gallery.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada foto. Tambahkan foto pertama ke galeri.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Foto</th>
                  <th className="p-4 font-medium">Caption</th>
                  <th className="p-4 font-medium">Ditambahkan</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {gallery.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                  >
                    <td className="p-4">
                      <PackageImage
                        src={item.imageUrl}
                        alt={pickLocale(item.caption)}
                        className="h-16 w-16 shrink-0 rounded-2xl"
                      />
                    </td>
                    <td className="p-4">
                      <p className="line-clamp-2 max-w-md text-muted-foreground">
                        {pickLocale(item.caption) || "-"}
                      </p>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <GalleryRowActions item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
