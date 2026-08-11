import { BenefitsSection } from "@/components/layout/sections/benefits";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { HeroSection } from "@/components/layout/sections/hero2";
import { FeaturedPackages } from "@/components/layout/sections/featured-packages";
import { TestimonialSection } from "@/components/layout/sections/testimonial";
import { BlogSection } from "@/components/layout/sections/blog";
import { listPackages, serializePackage } from "@/lib/db/repositories/packages";
import {
  listTestimonials,
  serializeTestimonial,
} from "@/lib/db/repositories/testimonials";
import { listPublishedPostsWithCategory } from "@/lib/db/repositories/blog";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
import { defaultOgImage } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const seo = getSeo("home", locale);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: seo.title,
      description: seo.description,
      url: "/",
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

export default async function Home() {
  const { items } = await listPackages({ activeOnly: true, limit: 4 });
  const packages = items.map(serializePackage);
  const { items: testimonialRows } = await listTestimonials({
    activeOnly: true,
    limit: 12,
  });
  const testimonials = testimonialRows.map(serializeTestimonial);
  const { items: blogRows } = await listPublishedPostsWithCategory({
    limit: 3,
  });

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FeaturedPackages packages={packages} />
      <FeaturesSection />
      <TestimonialSection testimonials={testimonials} />
      <BlogSection posts={blogRows} />
      <ContactSection />
      <FAQSection />
    </>
  );
}
