import Link from "next/link";
import { Ship } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { iconBox: "h-8 w-8", icon: "h-4 w-4", text: "text-sm" },
  md: { iconBox: "h-9 w-9", icon: "h-5 w-5", text: "text-lg" },
  lg: { iconBox: "h-12 w-12", icon: "h-6 w-6", text: "text-2xl" },
} as const;

type LogoSize = keyof typeof sizes;

export function Logo({
  href = "/",
  size = "md",
  showText = true,
  className,
}: {
  href?: string;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}) {
  const s = sizes[size];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center font-semibold tracking-tight",
        className,
      )}
    >
      <span
        className={cn(
          "mr-2 flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground",
          s.iconBox,
        )}
      >
        <Ship className={s.icon} />
      </span>
      {showText && <span className={s.text}>Destitour</span>}
    </Link>
  );
}
