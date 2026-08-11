import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listTransportProducts, localizeTransportProduct } from "@/lib/db/repositories/transport";
import { PackageImage } from "@/components/package/package-image";
import { formatCurrency } from "@/lib/utils/format";
import { TransportRowActions } from "@/components/admin/transport-row-actions";
import { ExportButton } from "@/components/ui/data-export";
import { PaginationNav } from "@/components/ui/pagination-nav";

export const metadata = {
  title: "Produk Transport - Admin Destitour",
};

export default async function AdminTransportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 10;

  const result = await listTransportProducts({ activeOnly: false, page, limit });

  // Clamp an out-of-range page (e.g. ?page=999) to the last available page.
  const safePage =
    result.totalPages > 0 ? Math.min(page, result.totalPages) : page;
  const safeResult =
    safePage !== page
      ? await listTransportProducts({ activeOnly: false, page: safePage, limit })
      : result;

  const products = safeResult.items.map((p) => localizeTransportProduct(p, "id"));

  const activeTotal = (
    await listTransportProducts({ activeOnly: true, page: 1, limit: 1 })
  ).total;

  function pageHref(next: number) {
    return `/admin/transport?page=${next}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Produk Transport
          </h1>
          <p className="mt-2 text-muted-foreground">
            {safeResult.total} produk terdaftar, {activeTotal} aktif
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            resource="transport"
            filename="transport"
            label="Export"
          />
          <Button asChild size="lg" className="rounded-full">
            <Link href="/admin/transport/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Link>
          </Button>
        </div>
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

      <PaginationNav
        page={safeResult.page}
        totalPages={safeResult.totalPages}
        buildHref={pageHref}
      />
    </div>
  );
}
