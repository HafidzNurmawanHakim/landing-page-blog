import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
import { defaultOgImage } from "@/lib/seo";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import {
  getGalleryReactionStates,
  listGalleryItems,
  serializeGalleryItem,
} from "@/lib/db/repositories/gallery";
import { getClientIp } from "@/lib/security/rate-limit";

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

export default async function GalleryPage() {
  const { items } = await listGalleryItems({ limit: 100 });
  const gallery = items.map(serializeGalleryItem);

  // Preload which photos this visitor already liked/shared so the buttons
  // render the correct state on first paint (docs/05-api-server-actions.md).
  const ip = await getClientIp();
  const states = await getGalleryReactionStates(
    gallery.map((item) => item.id),
    ip
  );
  const reactions = Object.fromEntries(states);

  return <GalleryGrid items={gallery} reactions={reactions} />;
}
