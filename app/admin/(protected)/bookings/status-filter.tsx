import Link from "next/link";
import { cn } from "@/lib/utils";
import { statusLabels, statusOrder } from "@/components/booking/status-badge";

const FILTERS = ["all", ...statusOrder] as const;

export function StatusFilter({ selected }: { selected: string }) {
  function href(value: string) {
    if (value === "all") return "/admin/bookings";
    return `/admin/bookings?status=${value}`;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((value) => (
        <Link
          key={value}
          href={href(value)}
          aria-current={selected === value ? "page" : undefined}
          className={cn(
            "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
            selected === value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {value === "all" ? "Semua" : statusLabels[value]}
        </Link>
      ))}
    </div>
  );
}
