import { Card, CardContent } from "@/components/ui/card";
import { getSiteConfig } from "@/lib/services/site-config";
import { SiteConfigForm } from "@/components/admin/site-config-form";

export const metadata = {
  title: "Konfigurasi - Admin Destitour",
};

export default async function AdminConfigPage() {
  const config = await getSiteConfig();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Konfigurasi Situs
        </h1>
        <p className="mt-2 text-muted-foreground">
          Source of truth untuk kontak, sosial media, nomor WhatsApp admin, dan
          email notifikasi. Perubahan langsung diterapkan di seluruh situs.
        </p>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <SiteConfigForm config={config} />
        </CardContent>
      </Card>
    </div>
  );
}
