"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[global-error]", error);
  }, [error]);

  return (
    <main className="container flex min-h-screen flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        {t("error.title")}
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {t("error.desc")}
        {error.digest ? ` (Kode: ${error.digest})` : ""}
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="lg" className="rounded-full" onClick={reset}>
          {t("error.retry")}
        </Button>
        <Button asChild size="lg" variant="secondary" className="rounded-full">
          <Link href="/">{t("error.home")}</Link>
        </Button>
      </div>
    </main>
  );
}
