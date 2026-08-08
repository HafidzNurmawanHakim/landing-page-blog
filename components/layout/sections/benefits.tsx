"use client";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  MessageCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

interface BenefitsProps {
  icon: "Wallet" | "MessageCircle" | "Compass" | "ShieldCheck";
  titleKey: string;
  descriptionKey: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: "Wallet",
    titleKey: "benefits.b1.title",
    descriptionKey: "benefits.b1.desc",
  },
  {
    icon: "MessageCircle",
    titleKey: "benefits.b2.title",
    descriptionKey: "benefits.b2.desc",
  },
  {
    icon: "Compass",
    titleKey: "benefits.b3.title",
    descriptionKey: "benefits.b3.desc",
  },
  {
    icon: "ShieldCheck",
    titleKey: "benefits.b4.title",
    descriptionKey: "benefits.b4.desc",
  },
];

const icons = { Wallet, MessageCircle, Compass, ShieldCheck };

export const BenefitsSection = () => {
  const { t } = useI18n();

  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-16">
        <div className="mb-10 lg:mb-0">
          <h2 className="text-lg text-primary mb-2 tracking-wider">
            {t("benefits.title")}
          </h2>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("benefits.heading")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 lg:w-5/6">
            {t("benefits.desc")}
          </p>

          <div className="mt-6">
            <Button asChild className="rounded-full" size="lg">
              <Link href="/packages">
                {t("hero.seePackages")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, titleKey, descriptionKey }, index) => (
            <Card
              key={titleKey}
              className="bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <Icon
                    icon={icons[icon]}
                    size={32}
                    color="hsl(var(--primary))"
                    className="mb-6 text-primary"
                  />
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>

                <CardTitle>{t(titleKey)}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground">
                {t(descriptionKey)}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
