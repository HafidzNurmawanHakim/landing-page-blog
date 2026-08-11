import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
import { pickLocale } from "@/lib/i18n/locales";
import { defaultOgImage } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogCategoryFilter } from "./category-filter";
import {
  listPublishedPostsWithCategory,
  getAllBlogCategories,
  localizeBlogPost,
} from "@/lib/db/repositories/blog";
import { formatDate } from "@/lib/utils/format";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const seo = getSeo("blog", locale);
  const url = `${siteConfig.url}/blog`;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: seo.title,
      description: seo.description,
      url,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [defaultOgImage.url],
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const locale = await getServerLocale();
  const selected = sp.category?.trim() || null;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 9;

  const [categories, result] = await Promise.all([
    getAllBlogCategories(),
    listPublishedPostsWithCategory({ categorySlug: selected ?? undefined, page, limit }),
  ]);

  const safePage = result.totalPages > 0 ? Math.min(page, result.totalPages) : page;
  const safeResult =
    safePage !== page
      ? await listPublishedPostsWithCategory({
          categorySlug: selected ?? undefined,
          page: safePage,
          limit,
        })
      : result;

  function pageHref(next: number) {
    const params = new URLSearchParams();
    if (selected) params.set("category", selected);
    params.set("page", String(next));
    return `/blog?${params.toString()}`;
  }

  const categoryChips = categories.map((c) => ({
    slug: c.slug,
    name: pickLocale(c.name, locale),
  }));

  return (
    <main className="container py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          {pickLocale({ id: "Blog", en: "Blog", ms: "Blog", zh: "博客" }, locale)}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          {pickLocale(
            {
              id: "Tips wisata, itinerary, dan cerita dari Batam. Dibuat oleh tim Destitour.",
              en: "Travel tips, itineraries, and stories from Batam. Written by the Destitour team.",
              ms: "Tips pelancongan, itinerary, dan cerita dari Batam. Ditulis oleh pasukan Destitour.",
              zh: "来自巴淡岛的旅行贴士、行程和故事。由巴淡之旅团队撰写。",
            },
            locale
          )}
        </p>
      </header>

      <BlogCategoryFilter categories={categoryChips} selected={selected} />

      {safeResult.items.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-3xl bg-card p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Newspaper className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">
            {pickLocale(
              { id: "Belum ada artikel", en: "No articles yet", ms: "Belum ada artikel", zh: "暂无文章" },
              locale
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pickLocale(
              {
                id: "Artikel untuk kategori ini belum tersedia. Coba kategori lain atau kembali lagi nanti.",
                en: "No articles for this category yet. Try another category or check back later.",
                ms: "Artikel untuk kategori ini belum tersedia. Cuba kategori lain atau kembali kemudian.",
                zh: "此类别暂无文章。请尝试其他类别或稍后再来。",
              },
              locale
            )}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {safeResult.items.map((post) => {
            const item = localizeBlogPost(post, locale);
            return (
              <BlogCard
                key={item.id}
                title={item.title}
                slug={item.slug}
                excerpt={item.excerpt}
                featuredImageUrl={item.featuredImageUrl}
                featuredImageAlt={item.featuredImageAlt}
                categoryName={item.categoryName}
                categorySlug={item.categorySlug}
                publishedAtLabel={formatDate(item.publishedAt ?? item.createdAt)}
                readingTime={item.readingTime}
                readLabel={pickLocale(
                  { id: "Baca", en: "Read", ms: "Baca", zh: "阅读" },
                  locale
                )}
              />
            );
          })}
        </div>
      )}

      {safeResult.totalPages > 1 && (
        <nav
          className="mt-12 flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            asChild={safePage > 1}
            variant="ghost"
            size="icon"
            disabled={safePage <= 1}
            className="rounded-full"
          >
            {safePage > 1 ? (
              <Link href={pageHref(safePage - 1)} aria-label="Halaman sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            {safeResult.page} / {safeResult.totalPages}
          </span>
          <Button
            asChild={safePage < safeResult.totalPages}
            variant="ghost"
            size="icon"
            disabled={safePage >= safeResult.totalPages}
            className="rounded-full"
          >
            {safePage < safeResult.totalPages ? (
              <Link href={pageHref(safePage + 1)} aria-label="Halaman berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </nav>
      )}
    </main>
  );
}
