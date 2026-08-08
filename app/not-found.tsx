"use client";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Compass className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        {t("notFound.title")}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {t("notFound.desc")}
      </p>
      <Button asChild size="lg" className="mt-8 rounded-full">
        <Link href="/">{t("notFound.home")}</Link>
      </Button>
    </main>
  );
}
