import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export type OgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export const defaultOgImage: OgImage = {
  url: `${siteConfig.url}/img/og-destitour.webp`,
  width: 960,
  height: 507,
  alt: siteConfig.name,
};

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  images,
}: {
  title: string;
  description?: string;
  path: string;
  type?: "website" | "article";
  images?: OgImage[];
}): Metadata {
  const url = `${siteConfig.url}${path}`;
  const ogImages = images && images.length > 0 ? images : [defaultOgImage];

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}
