import { BenefitsSection } from "@/components/layout/sections/benefits";
import { ContactSection } from "@/components/layout/sections/contact";
import { FAQSection } from "@/components/layout/sections/faq";
import { FeaturesSection } from "@/components/layout/sections/features";
import { HeroSection } from "@/components/layout/sections/hero";
import { FeaturedPackages } from "@/components/layout/sections/featured-packages";
import { TestimonialSection } from "@/components/layout/sections/testimonial";
import { listPackages, serializePackage } from "@/lib/db/repositories/packages";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Destitour - Booking Paket Wisata",
  description:
    "Marketplace paket tour Batam: Tour, Transport, Hotel. Booking online dengan konfirmasi cepat via WhatsApp.",
  openGraph: {
    type: "website",
    title: "Destitour - Booking Paket Wisata",
    description:
      "Marketplace paket tour Batam: Tour, Transport, Hotel. Booking online dengan konfirmasi cepat via WhatsApp.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Destitour - Booking Paket Wisata",
    description:
      "Marketplace paket tour Batam: Tour, Transport, Hotel. Booking online dengan konfirmasi cepat via WhatsApp.",
  },
};

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
