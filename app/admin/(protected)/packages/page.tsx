import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPackages, serializePackage } from "@/lib/db/repositories/packages";
import { pickLocale } from "@/lib/i18n/locales";
import { formatIDR } from "@/lib/utils/format";
import { PackageImage } from "@/components/package/package-image";
import { PackageRowActions } from "@/components/admin/package-row-actions";

export const metadata = {
  title: "Paket & Produk - Admin Destitour",
};

const categoryLabels: Record<string, string> = {
  tour: "Tour",
  transport: "Transport",
  hotel: "Hotel",
};

export default async function AdminPackagesPage() {
  const { items } = await listPackages({ activeOnly: false });
  const packages = items.map(serializePackage);
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Paket & Produk
          </h1>
          <p className="mt-2 text-muted-foreground">
            {packages.length} paket terdaftar,{" "}
            {items.filter((p) => p.isActive === 1).length} aktif
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/packages/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Paket
          </Link>
        </Button>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {packages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada paket. Tambahkan paket pertama kamu.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Paket</th>
                  <th className="p-4 font-medium">Kode</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Durasi</th>
                  <th className="p-4 font-medium">Harga</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <PackageImage
                          src={pkg.imageUrl}
                          alt={pickLocale(pkg.imageAlt)}
                          className="h-12 w-16 shrink-0 rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {pickLocale(pkg.name)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            /{pkg.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{pkg.code}</td>
                    <td className="p-4">
                      {categoryLabels[pkg.category] ?? pkg.category}
                    </td>
                    <td className="p-4">{pkg.duration || "-"}</td>
                    <td className="p-4 font-medium">{formatIDR(pkg.price)}</td>
                    <td className="p-4">
                      {pkg.isActive === 1 ? (
                        <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="rounded-full bg-secondary text-muted-foreground">
                          Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <PackageRowActions pkg={pkg} />
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
