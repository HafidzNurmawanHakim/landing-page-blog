import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImageUrl?: string | null;
  featuredImageAlt?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  publishedAtLabel?: string;
  readingTime?: number;
  readLabel?: string;
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImageUrl,
  featuredImageAlt,
  categoryName,
  categorySlug,
  publishedAtLabel,
  readingTime = 1,
  readLabel = "Baca",
}: BlogCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link
        href={`/blog/${slug}`}
        className="relative block aspect-[16/10] w-full overflow-hidden"
        aria-label={title}
      >
        {featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImageUrl}
            alt={featuredImageAlt || title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary text-3xl font-bold text-primary/40">
            {title.slice(0, 2).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-2">
          {categoryName && categorySlug ? (
            <Link href={`/blog?category=${categorySlug}`}>
              <Badge
                className="border-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                variant="outline"
              >
                {categoryName}
              </Badge>
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {readingTime} min
          </span>
        </div>

        <h3 className="text-lg font-semibold leading-snug tracking-tight">
          <Link
            href={`/blog/${slug}`}
            className="transition-colors group-hover:text-primary"
          >
            {title}
          </Link>
        </h3>

        {excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">
            {excerpt}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          {publishedAtLabel ? (
            <span className="text-xs text-muted-foreground">{publishedAtLabel}</span>
          ) : (
            <span />
          )}
          <Link
            href={`/blog/${slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
          >
            {readLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
