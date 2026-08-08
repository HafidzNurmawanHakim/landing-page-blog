import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listTransportProducts, localizeTransportProduct } from "@/lib/db/repositories/transport";
import { PackageImage } from "@/components/package/package-image";
import { formatCurrency } from "@/lib/utils/format";
import { TransportRowActions } from "@/components/admin/transport-row-actions";

export const metadata = {
  title: "Produk Transport - Admin Destitour",
};

export default async function AdminTransportPage() {
  const { items } = await listTransportProducts({ activeOnly: false });
  const products = items.map((p) => localizeTransportProduct(p, "id"));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Produk Transport
          </h1>
          <p className="mt-2 text-muted-foreground">
            {products.length} produk terdaftar,{" "}
            {products.filter((p) => p.isActive === 1).length} aktif
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/transport/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Link>
        </Button>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {products.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada produk transport. Tambahkan kendaraan pertama kamu.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Kode</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Kapasitas</th>
                  <th className="p-4 font-medium">Harga Mulai</th>
                  <th className="p-4 font-medium">Paket</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <PackageImage
                          src={product.featuredImage}
                          alt={product.title}
                          className="h-12 w-16 shrink-0 rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {product.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs">{product.code}</td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4">
                      {product.capacity} {product.capacityUnit}
                    </td>
                    <td className="p-4 font-medium">
                      {product.priceFrom > 0
                        ? formatCurrency(product.priceFrom, product.currency)
                        : "-"}
                    </td>
                    <td className="p-4">{product.pricingPackages.length}</td>
                    <td className="p-4">
                      {product.isActive === 1 ? (
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
                      <TransportRowActions product={product} />
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
