"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n/provider";

const FAQList: { questionKey: string; answerKey: string; value: string }[] = [
  { questionKey: "faq.q1", answerKey: "faq.a1", value: "item-1" },
  { questionKey: "faq.q2", answerKey: "faq.a2", value: "item-2" },
  { questionKey: "faq.q3", answerKey: "faq.a3", value: "item-3" },
  { questionKey: "faq.q4", answerKey: "faq.a4", value: "item-4" },
  { questionKey: "faq.q5", answerKey: "faq.a5", value: "item-5" },
];

export const FAQSection = () => {
  const { t } = useI18n();

  return (
    <section id="faq" className="container md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className="text-lg text-primary text-center mb-2 tracking-wider">
          {t("faq.title")}
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          {t("faq.heading")}
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ questionKey, answerKey, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {t(questionKey)}
            </AccordionTrigger>

            <AccordionContent>{t(answerKey)}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
