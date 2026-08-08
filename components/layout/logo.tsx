import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
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
      className={cn("flex items-center", className)}
      aria-label="Destitour"
    >
      <Image
        src="/img/logo/long.webp"
        alt="Destitour"
        width={2400}
        height={695}
        className={cn("h-auto w-auto", sizes[size])}
        priority
      />
    </Link>
  );
}
