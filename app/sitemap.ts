import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import { listPackages } from "@/lib/db/repositories/packages";
import { listTransportProducts } from "@/lib/db/repositories/transport";
import { listPublishedPostsWithCategory } from "@/lib/db/repositories/blog";

export const dynamic = "force-dynamic";

function ts(date?: number | null): string | undefined {
  return date ? new Date(date * 1000).toISOString() : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const [packages, transport, posts] = await Promise.all([
    listPackages({ activeOnly: true }),
    listTransportProducts({ activeOnly: true }),
    listPublishedPostsWithCategory({}),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/packages`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/transport`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/gallery`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...packages.items.map((pkg) => ({
      url: `${base}/packages/${pkg.slug}`,
      lastModified: ts(pkg.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...transport.items.map((product) => ({
      url: `${base}/transport/${product.slug}`,
      lastModified: ts(product.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.items.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: ts(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
