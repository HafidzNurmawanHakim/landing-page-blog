import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const;

const textSizes = {
  sm: "text-md",
  md: "text-lg",
  lg: "text-xl",
} as const;

type LogoSize = keyof typeof sizes;

export function Logo({
  href = "/",
  size = "md",
  className,
}: {
  href?: string;
  size?: LogoSize;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2", className)}
      aria-label="Destitour"
    >
      <Image
        src="/img/logo/logo-destitour.webp"
        alt=""
        width={480}
        height={480}
        className={cn("h-auto w-auto", sizes[size])}
        priority
      />
      <span className={cn("font-medium tracking-tight", textSizes[size])}>
        Destitour
      </span>
    </Link>
  );
}
