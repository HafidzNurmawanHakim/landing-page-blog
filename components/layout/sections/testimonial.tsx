"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RatingStars } from "@/components/ui/rating-stars";
import type { SerializedTestimonial } from "@/lib/db/repositories/testimonials";
import { pickLocale } from "@/lib/i18n/locales";
import { useI18n } from "@/lib/i18n/provider";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const TestimonialSection = ({
  testimonials,
}: {
  testimonials: SerializedTestimonial[];
}) => {
  const { t, locale } = useI18n();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          {t("testimonial.title")}
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          {t("testimonial.heading")}
        </h2>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {testimonials.map((review) => {
            const comment = pickLocale(review.comment, locale);
            const role = pickLocale(review.role, locale);
            return (
              <CarouselItem
                key={review.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <Card className="flex h-full flex-col bg-muted/50 dark:bg-card">
                  <CardContent className="flex flex-1 flex-col pt-6">
                    <RatingStars rating={review.rating} starClassName="size-4" />
                    <p className="mt-4 line-clamp-5 text-foreground">
                      {`"${comment}"`}
                    </p>
                  </CardContent>

                  <CardHeader>
                    <div className="flex flex-row items-center gap-4">
                      <Avatar>
                        {review.avatarUrl && (
                          <AvatarImage src={review.avatarUrl} alt={review.name} />
                        )}
                        <AvatarFallback>{initialsOf(review.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col">
                        <CardTitle className="text-lg">{review.name}</CardTitle>
                        {role && <CardDescription>{role}</CardDescription>}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
