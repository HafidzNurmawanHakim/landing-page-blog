import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
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

export default function AboutPage() {
  return <AboutView />;
}
