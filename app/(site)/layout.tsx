import { Navbar } from "@/components/layout/navbar";
import { FooterSection } from "@/components/layout/sections/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <FooterSection />
      <WhatsAppButton />
    </>
  );
}
