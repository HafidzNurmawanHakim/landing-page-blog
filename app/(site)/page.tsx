import { BenefitsSection } from "@/components/layout/sections/benefits";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { HeroSection } from "@/components/layout/sections/hero";
import { FeaturedPackages } from "@/components/layout/sections/featured-packages";
import { TestimonialSection } from "@/components/layout/sections/testimonial";
import { listPackages, serializePackage } from "@/lib/db/repositories/packages";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo } from "@/lib/config/site";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const seo = getSeo("home", locale);
  return {
    title: seo.title,
    description: seo.description,
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function Home() {
  const { items } = await listPackages({ activeOnly: true, limit: 4 });
  const packages = items.map(serializePackage);

  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FeaturesSection />
      <FeaturedPackages packages={packages} />
      <TestimonialSection />
      <ContactSection />
      <FAQSection />
    </>
  );
}
