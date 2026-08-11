import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shared pagination for admin list tables (docs/12-design-rules.md: buttons
 * rounded-full, plain text page indicator). Renders nothing for a single page.
 */
export function PaginationNav({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-2", className)}
      aria-label="Pagination"
    >
      <PageButton
        href={buildHref(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageButton>
      <span className="px-3 text-sm text-muted-foreground">
        Halaman {page} / {totalPages}
      </span>
      <PageButton
        href={buildHref(page + 1)}
        disabled={page >= totalPages}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  href,
  disabled,
  children,
  ...props
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLAnchorElement>) {
  if (disabled) {
    return (
      <Button variant="ghost" size="icon" disabled className="rounded-full">
        {children}
      </Button>
    );
  }
  return (
    <Button asChild variant="ghost" size="icon" className="rounded-full">
      <Link href={href} {...props}>
        {children}
      </Link>
    </Button>
  );
}
