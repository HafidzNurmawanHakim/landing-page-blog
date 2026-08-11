import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
import { defaultOgImage } from "@/lib/seo";
import { AboutView } from "./about-view";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const seo = getSeo("about", locale);
  const url = `${siteConfig.url}/about`;

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

export default function AboutPage() {
  return <AboutView />;
}
