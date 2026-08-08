import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getBookingById } from "@/lib/db/repositories/bookings";
import { StatusBadge } from "@/components/booking/status-badge";
import { formatDate } from "@/lib/utils/format";
import { StatusUpdateForm } from "./status-update-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Booking #${id} - Admin Destitour` };
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookingId = Number(id);
  if (!Number.isInteger(bookingId) || bookingId <= 0) notFound();

  const booking = await getBookingById(bookingId);
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke dashboard
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {booking.bookingCode}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dibuat {formatDate(booking.createdAt)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </header>

      <Card className="rounded-3xl">
        <CardHeader>
          <h2 className="text-lg font-semibold">Data Customer</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">Nama</span>
            <span className="text-right font-medium">
              {booking.customerName}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">No. HP / WA</span>
            <a
              href={`tel:${booking.phone}`}
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {booking.phone}
            </a>
          </div>
          <div className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">Email</span>
            {booking.email ? (
              <a
                href={`mailto:${booking.email}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {booking.email}
              </a>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardHeader>
          <h2 className="text-lg font-semibold">Detail Booking</h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DetailRow
            label="Tipe"
            value={booking.itemType === "transport" ? "Transport" : "Paket Tour"}
          />
          <DetailRow label="Paket" value={booking.packageName} />
          <DetailRow label="Kode Paket" value={booking.packageCode} />
          {booking.itemType === "transport" && booking.bookingOptions ? (
            <TransportOptions booking={booking} />
          ) : (
            <>
              <DetailRow
                label="Tanggal Berangkat"
                value={formatDate(booking.departureDate)}
              />
              <DetailRow
                label="Tanggal Pulang"
                value={formatDate(booking.returnDate)}
              />
              <DetailRow
                label="Jumlah Peserta"
                value={`${booking.participants} orang`}
              />
            </>
          )}
          {booking.notes && (
            <DetailRow label="Catatan Customer" value={booking.notes} />
          )}
          {booking.adminNotes && (
            <DetailRow label="Catatan Admin" value={booking.adminNotes} />
          )}
        </CardContent>
      </Card>

      <StatusUpdateForm
        bookingId={booking.id}
        currentStatus={booking.status}
        isCancelled={booking.status === "cancelled"}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function TransportOptions({ booking }: { booking: import("@/lib/db/schema").Booking }) {
  const o = booking.bookingOptions;
  if (!o) return null;
  const unitTotal = o.price + o.extraTotal;
  const grandTotal = unitTotal * o.vehicleQty;
  return (
    <>
      <DetailRow
        label="Lokasi Jemput"
        value={`${o.pickupLocation} — ${o.pickupDate} ${o.pickupTime}`}
      />
      {o.dropoffLocation && (
        <DetailRow label="Lokasi Antar" value={o.dropoffLocation} />
      )}
      <DetailRow label="Jumlah Kendaraan" value={`${o.vehicleQty} unit`} />
      <DetailRow
        label="Paket Harga"
        value={`${o.pricingPackageName} — ${o.price} ${o.currency}`}
      />
      {o.extraCharges.length > 0 && (
        <DetailRow
          label="Biaya Tambahan"
          value={o.extraCharges
            .map((e) => `${e.name} (+${e.price} ${e.currency})`)
            .join("; ")}
        />
      )}
      <DetailRow
        label="Estimasi Total"
        value={`${grandTotal} ${o.currency}`}
      />
    </>
  );
}
