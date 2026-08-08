import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/db/repositories/bookings";

const statusStyles: Record<BookingStatus, string> = {
  pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
};

export const statusLabels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Dikonfirmasi",
  cancelled: "Dibatalkan",
  completed: "Selesai",
};

export const statusOrder: BookingStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const style = statusStyles[status as BookingStatus] ?? statusStyles.pending;
  const label = statusLabels[status as BookingStatus] ?? status;
  return (
    <Badge className={cn("rounded-full", style, className)}>{label}</Badge>
  );
}
