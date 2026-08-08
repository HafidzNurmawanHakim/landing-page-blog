"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBookingStatus } from "@/app/actions/admin";
import { statusLabels, statusOrder } from "@/components/booking/status-badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/db/repositories/bookings";

export function StatusUpdateForm({
  bookingId,
  currentStatus,
  isCancelled,
}: {
  bookingId: number;
  currentStatus: string;
  isCancelled: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(currentStatus);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(currentStatus);
  }, [currentStatus]);

  async function onSubmit() {
    if (selected === currentStatus) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateBookingStatus({
        id: bookingId,
        status: selected,
        adminNotes: selected === "cancelled" ? adminNotes || undefined : undefined,
      });
      if (!result.success) {
        setError(result.message);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah status. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCancelled) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Booking ini sudah dibatalkan dan tidak dapat diubah.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <h2 className="text-lg font-semibold">Ubah Status</h2>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2" role="group" aria-label="Status booking">
          {statusOrder.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelected(status)}
              aria-pressed={selected === status}
              className={cn(
                "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
                selected === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {statusLabels[status as BookingStatus]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminNotes">
            Catatan Admin (wajib saat membatalkan)
          </Label>
          <Textarea
            id="adminNotes"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Alasan pembatalan atau catatan internal..."
            className="rounded-3xl"
            disabled={selected !== "cancelled"}
          />
        </div>

        <Button
          size="lg"
          className="rounded-full"
          disabled={isSubmitting || selected === currentStatus}
          onClick={() => void onSubmit()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
