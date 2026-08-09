"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import type { BlogPostWithCategory } from "@/lib/db/repositories/blog";
import { pickLocale } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";

export function BlogSection({
  posts,
}: {
  posts: BlogPostWithCategory[];
}) {
  const { t, locale } = useI18n();

  return (
    <section id="blog" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        {t("blog.title")}
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        {t("blog.heading")}
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-10">
        {t("blog.subtitle")}
      </h3>

      {posts.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Newspaper className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">{t("blog.emptyTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("blog.emptyDesc")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              title={pickLocale(post.title, locale)}
              slug={post.slug}
              excerpt={pickLocale(post.excerpt, locale)}
              featuredImageUrl={post.featuredImageUrl}
              featuredImageAlt={pickLocale(post.featuredImageAlt, locale)}
              categoryName={pickLocale(post.categoryName, locale)}
              categorySlug={post.categorySlug}
              publishedAtLabel={formatDate(post.publishedAt ?? post.createdAt)}
              readingTime={post.readingTime}
              readLabel={pickLocale(
                { id: "Baca", en: "Read", ms: "Baca", zh: "阅读" },
                locale
              )}
            />
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/blog">
            {t("blog.viewAll")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
