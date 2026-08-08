import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { I18nProvider } from "@/lib/i18n/provider";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo, siteConfig } from "@/lib/config/site";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const seo = getSeo("home", locale);

  return {
    title: seo.title,
    description: seo.description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: "/" },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          poppins.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider initialLocale={locale}>{children}</I18nProvider>
          <Toaster position="top-center" toastOptions={{ className: "rounded-full" }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
