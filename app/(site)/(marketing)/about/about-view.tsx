"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Eye, HeartHandshake, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/provider";

const values = [
  {
    icon: Sparkles,
    titleKey: "about.values.v1.title",
    descKey: "about.values.v1.desc",
  },
  {
    icon: Zap,
    titleKey: "about.values.v2.title",
    descKey: "about.values.v2.desc",
  },
  {
    icon: HeartHandshake,
    titleKey: "about.values.v3.title",
    descKey: "about.values.v3.desc",
  },
  {
    icon: ShieldCheck,
    titleKey: "about.values.v4.title",
    descKey: "about.values.v4.desc",
  },
] as const;

const stats = [
  { valueKey: "about.stats.y1.value", labelKey: "about.stats.y1.label" },
  { valueKey: "about.stats.y2.value", labelKey: "about.stats.y2.label" },
  { valueKey: "about.stats.y3.value", labelKey: "about.stats.y3.label" },
  { valueKey: "about.stats.y4.value", labelKey: "about.stats.y4.label" },
] as const;

export function AboutView() {
  const { t } = useI18n();

  return (
    <>
      <section className="container py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="rounded-full border-0 bg-secondary text-foreground">
            {t("about.badge")}
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            {t("about.heading")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("about.intro")}
          </p>
        </div>
      </section>

      <section className="container pb-24 sm:pb-32">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              width={800}
              height={500}
              className="w-full rounded-3xl object-cover"
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80"
              alt="Batam"
            />
          </div>

          <div>
            <h2 className="text-lg text-primary tracking-wider">
              {t("about.title")}
            </h2>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              {t("about.storyTitle")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("about.story1")}</p>
            <p className="mt-4 text-muted-foreground">{t("about.story2")}</p>
          </div>
        </div>
      </section>

      <section className="container pb-24 sm:pb-32">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-3xl bg-card">
            <CardHeader>
              <Compass className="mb-6 h-8 w-8 text-primary" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                {t("about.missionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {t("about.mission")}
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-card">
            <CardHeader>
              <Eye className="mb-6 h-8 w-8 text-primary" />
              <CardTitle className="text-xl font-semibold tracking-tight">
                {t("about.visionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {t("about.vision")}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container pb-24 sm:pb-32">
        <div className="mb-12 text-center">
          <h2 className="text-lg text-primary tracking-wider">
            {t("about.values.title")}
          </h2>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {t("about.values.heading")}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map(({ icon: Icon, titleKey, descKey }) => (
            <Card
              key={titleKey}
              className="rounded-3xl bg-card transition-colors hover:bg-background"
            >
              <CardHeader>
                <Icon className="mb-6 h-8 w-8 text-primary" />
                <CardTitle>{t(titleKey)}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {t(descKey)}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-24 sm:pb-32">
        <div className="rounded-3xl bg-card p-8 md:p-12">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
            {t("about.stats.title")}
          </h2>

          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(({ valueKey, labelKey }) => (
              <div key={valueKey} className="text-center">
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {t(valueKey)}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {t(labelKey)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
