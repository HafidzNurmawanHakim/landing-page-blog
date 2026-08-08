"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import {
  Bus,
  CalendarDays,
  CarFront,
  Hotel,
  MessageCircle,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface FeaturesProps {
  icon: "Bus" | "CarFront" | "Hotel" | "Users" | "CalendarDays" | "MessageCircle";
  titleKey: string;
  descriptionKey: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: "Bus",
    titleKey: "features.f1.title",
    descriptionKey: "features.f1.desc",
  },
  {
    icon: "CarFront",
    titleKey: "features.f2.title",
    descriptionKey: "features.f2.desc",
  },
  {
    icon: "Hotel",
    titleKey: "features.f3.title",
    descriptionKey: "features.f3.desc",
  },
  {
    icon: "Users",
    titleKey: "features.f4.title",
    descriptionKey: "features.f4.desc",
  },
  {
    icon: "CalendarDays",
    titleKey: "features.f5.title",
    descriptionKey: "features.f5.desc",
  },
  {
    icon: "MessageCircle",
    titleKey: "features.f6.title",
    descriptionKey: "features.f6.desc",
  },
];

const icons = {
  Bus,
  CarFront,
  Hotel,
  Users,
  CalendarDays,
  MessageCircle,
};

export const FeaturesSection = () => {
  const { t } = useI18n();

  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
        {t("features.title")}
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        {t("features.heading")}
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        {t("features.desc")}
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, titleKey, descriptionKey }) => (
          <div key={titleKey}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className="bg-primary/20 p-2 rounded-full ring-8 ring-primary/10 mb-4">
                  <Icon
                    icon={icons[icon]}
                    size={24}
                    color="hsl(var(--primary))"
                    className="text-primary"
                  />
                </div>

                <CardTitle>{t(titleKey)}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {t(descriptionKey)}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
