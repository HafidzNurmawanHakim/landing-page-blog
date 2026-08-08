import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import {
  listGalleryItems,
  serializeGalleryItem,
} from "@/lib/db/repositories/gallery";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const seo = getSeo("gallery", locale);
  const url = `${siteConfig.url}/gallery`;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function GalleryPage() {
  const { items } = await listGalleryItems({ limit: 100 });
  const gallery = items.map(serializeGalleryItem);

  return <GalleryGrid items={gallery} />;
}
