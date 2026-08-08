import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders a 5-star rating row. Supports fractional ratings via a half-filled
 * (clipped) star. Pure SVG, no animation — safe for SSR and server components.
 */
export function RatingStars({
  rating,
  className,
  starClassName = "h-4 w-4",
}: {
  rating: number;
  className?: string;
  starClassName?: string;
}) {
  const normalized = Math.max(0, Math.min(5, rating));

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`Rating ${normalized.toFixed(1)} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((pos) => {
        const fill = Math.max(0, Math.min(1, normalized - (pos - 1)));
        return (
          <span key={pos} className="relative inline-flex">
            <Star className={cn(starClassName, "text-muted-foreground/30")} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={cn(starClassName, "fill-primary text-primary")} />
            </span>
          </span>
        );
      })}
    </span>
  );
}
