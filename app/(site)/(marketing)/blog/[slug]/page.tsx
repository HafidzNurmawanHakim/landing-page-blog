import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { getServerLocale } from "@/lib/i18n/server";
import { pickLocale } from "@/lib/i18n/locales";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogReactions } from "@/components/blog/blog-reactions";
import {
  getBlogPostBySlug,
  getBlogCategoryById,
  getBlogPostReactionStates,
  getRecommendedBlogPosts,
  incrementBlogViewCount,
  localizeBlogPost,
  serializeBlogPost,
} from "@/lib/db/repositories/blog";
import { getClientIp } from "@/lib/security/rate-limit";
import { renderBlogContent } from "@/lib/services/blog-content";
import { formatDate } from "@/lib/utils/format";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);

  if (!post || post.status !== "published") {
    return { title: "Artikel Tidak Ditemukan - Destitour" };
  }

  const locale = await getServerLocale();
  const localized = localizeBlogPost(serializeBlogPost(post), locale);
  const url = `${siteConfig.url}/blog/${post.slug}`;
  const title = localized.seoTitle || localized.title;
  const description = localized.seoDescription || localized.excerpt || undefined;
  const image = post.ogImageUrl || post.featuredImageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: post.canonicalUrl || url },
    robots: post.noindex === 1 ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt * 1000).toISOString()
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post || post.status !== "published") notFound();

  const locale = await getServerLocale();
  const serialized = serializeBlogPost(post);
  const localized = localizeBlogPost(serialized, locale);
  const html = renderBlogContent(localized.content, post.contentType);
  const url = `${siteConfig.url}/blog/${post.slug}`;

  // Fire-and-forget view counter (docs/13-blog.md §8).
  await incrementBlogViewCount(post.id);

  // Category for the badge + recommendation scoring.
  const category = post.categoryId
    ? await getBlogCategoryById(post.categoryId).catch(() => null)
    : null;
  const categoryName = category
    ? pickLocale(category.name, locale)
    : null;

  // Like / share per-IP state preloaded so the buttons render correctly on
  // first paint (same model as the gallery, docs/05-api-server-actions.md).
  const ip = await getClientIp();
  const reactionState = (await getBlogPostReactionStates([post.id], ip)).get(
    post.id
  );

  // Recommendations: rank by shared tags, then category, then newest.
  let recommendations: Awaited<ReturnType<typeof getRecommendedBlogPosts>> = [];
  try {
    recommendations = await getRecommendedBlogPosts(
      post.id,
      serialized.tags,
      post.categoryId,
      3
    );
  } catch {
    recommendations = [];
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: localized.title,
    description: localized.excerpt ?? undefined,
    image: post.featuredImageUrl ?? undefined,
    datePublished: post.publishedAt
      ? new Date(post.publishedAt * 1000).toISOString()
      : undefined,
    dateModified: post.updatedAt
      ? new Date(post.updatedAt * 1000).toISOString()
      : undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: "Destitour",
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
  };

  return (
    <main className="container py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {pickLocale(
          { id: "Kembali ke blog", en: "Back to blog", ms: "Kembali ke blog", zh: "返回博客" },
          locale
        )}
      </Link>

      <article className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            {category && categoryName && (
              <Link href={`/blog?category=${category.slug}`}>
                <Badge className="border-0 rounded-full bg-primary/10 text-primary hover:bg-primary/20">
                  {categoryName}
                </Badge>
              </Link>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {post.readingTime}{" "}
              {pickLocale(
                { id: "min baca", en: "min read", ms: "minit baca", zh: "分钟阅读" },
                locale
              )}
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {localized.title}
          </h1>

          {localized.excerpt && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {localized.excerpt}
            </p>
          )}
        </header>

        {post.featuredImageUrl && (
          <div className="mb-10 overflow-hidden rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImageUrl}
              alt={localized.featuredImageAlt || localized.title}
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        )}

        <div
          className="prose prose-stone dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-12 border-t border-border pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {serialized.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-0 rounded-full bg-secondary text-secondary-foreground"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            <BlogReactions
              postId={post.id}
              title={localized.title}
              url={url}
              likedInitial={reactionState?.liked ?? false}
              sharedInitial={reactionState?.shared ?? false}
              likeCountInitial={post.likeCount ?? 0}
              shareCountInitial={post.shareCount ?? 0}
            />
          </div>
        </footer>
      </article>

      {recommendations.length > 0 && (
        <section className="mx-auto mt-20 max-w-6xl">
          <div className="mb-8 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">
              {pickLocale(
                { id: "Rekomendasi Blog", en: "Recommended Posts", ms: "Rekomendasi Blog", zh: "推荐文章" },
                locale
              )}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((item) => {
              const rec = localizeBlogPost(item, locale);
              return (
                <BlogCard
                  key={rec.id}
                  title={rec.title}
                  slug={rec.slug}
                  excerpt={rec.excerpt}
                  featuredImageUrl={rec.featuredImageUrl}
                  featuredImageAlt={rec.featuredImageAlt}
                  categoryName={rec.categoryName}
                  categorySlug={rec.categorySlug}
                  publishedAtLabel={formatDate(rec.publishedAt ?? rec.createdAt)}
                  readingTime={rec.readingTime}
                  readLabel={pickLocale(
                    { id: "Baca", en: "Read", ms: "Baca", zh: "阅读" },
                    locale
                  )}
                />
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-16 text-center">
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {pickLocale(
              { id: "Semua Artikel", en: "All Posts", ms: "Semua Artikel", zh: "所有文章" },
              locale
            )}
          </Link>
        </Button>
      </div>
    </main>
  );
}
