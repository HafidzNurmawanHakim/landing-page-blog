import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listBookings, normalizeStatus } from "@/lib/db/repositories/bookings";
import { StatusBadge, statusOrder } from "@/components/booking/status-badge";
import { formatDate } from "@/lib/utils/format";
import { ExportButton } from "@/components/ui/data-export";
import { PaginationNav } from "@/components/ui/pagination-nav";
import { StatusFilter } from "./status-filter";
import { SearchForm } from "./search-form";

const FILTERS = ["all", ...statusOrder] as const;

export const metadata = {
  title: "Dashboard Booking - Admin Destitour",
};

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = normalizeStatus(sp.status);
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 10;

  const result = await listBookings({ status, search, page, limit });

  // Clamp an out-of-range page (e.g. ?page=999) to the last available page.
  const safePage =
    result.totalPages > 0 ? Math.min(page, result.totalPages) : page;
  const safeResult =
    safePage !== page
      ? await listBookings({ status, search, page: safePage, limit })
      : result;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Dashboard Booking
          </h1>
          <p className="mt-2 text-muted-foreground">
            {safeResult.total} pesanan ditemukan
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SearchForm initialValue={search ?? ""} />
          <ExportButton
            resource="bookings"
            filename="booking"
            query={{ status, ...(search ? { search } : {}) }}
            label="Export"
          />
        </div>
      </header>

      <StatusFilter selected={status} />

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {safeResult.items.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Tidak ada booking yang cocok.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Kode Booking</th>
                  <th className="p-4 font-medium">Paket</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Tanggal</th>
                  <th className="p-4 font-medium">Peserta</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {safeResult.items.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="transition-colors hover:text-primary"
                      >
                        {booking.bookingCode}
                      </Link>
                    </td>
                    <td className="p-4">{booking.packageName}</td>
                    <td className="p-4">
                      <p>{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.phone}
                      </p>
                    </td>
                    <td className="p-4">{formatDate(booking.departureDate)}</td>
                    <td className="p-4">{booking.participants}</td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      >
                        <Link href={`/admin/bookings/${booking.id}`}>
                          Detail
                        </Link>
                      </Button>
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
        buildHref={(next) => paginationHref(status, search, next)}
      />
    </div>
  );
}

function paginationHref(
  status: string,
  search: string | undefined,
  page: number,
): string {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (search) params.set("search", search);
  params.set("page", String(page));
  return `/admin/bookings?${params.toString()}`;
}
