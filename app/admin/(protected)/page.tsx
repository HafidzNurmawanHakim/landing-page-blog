import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  Package,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/db/repositories/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { formatDate, formatIDR } from "@/lib/utils/format";

export const metadata = {
  title: "Dashboard - Admin Destitour",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Halo, Admin 👋
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ringkasan aktivitas platform Destitour.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/admin/packages/new">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Paket
          </Link>
        </Button>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Total Booking"
          value={String(stats.totalBookings)}
          tone="bg-secondary text-secondary-foreground"
          href="/admin/bookings"
        />
        <StatCard
          icon={Clock}
          label="Menunggu Konfirmasi"
          value={String(stats.pending)}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          href="/admin/bookings?status=pending"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Estimasi Pendapatan"
          value={formatIDR(stats.revenue)}
          tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          href="/admin/bookings"
        />
        <StatCard
          icon={Package}
          label="Paket Aktif"
          value={`${stats.activePackages} / ${stats.totalPackages}`}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
          href="/admin/packages"
        />
      </div>

      <Card className="rounded-3xl">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Booking Terbaru</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.confirmed} dikonfirmasi, {stats.completed} selesai,{" "}
              {stats.cancelled} dibatalkan
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/admin/bookings">
              Lihat semua
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {stats.recentBookings.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada booking. Cek halaman{" "}
              <Link
                href="/admin/packages"
                className="text-primary hover:underline"
              >
                Paket & Produk
              </Link>{" "}
              untuk mulai mengelola produk.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Kode</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Paket</th>
                  <th className="p-4 font-medium">Berangkat</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
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
                    <td className="p-4">{booking.customerName}</td>
                    <td className="p-4 text-muted-foreground">
                      {booking.packageName}
                    </td>
                    <td className="p-4">{formatDate(booking.departureDate)}</td>
                    <td className="p-4">
                      <StatusBadge status={booking.status} />
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

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="rounded-3xl transition-colors group-hover:bg-accent">
        <CardContent className="flex items-center gap-4 p-6">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <p className="truncate text-2xl font-semibold tracking-tight">
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
