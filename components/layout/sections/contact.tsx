"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Building2, Clock, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n/provider";
import { siteConfig, pickSiteText } from "@/lib/config/site";

const formSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.string().email(),
  subject: z.string().min(2).max(255),
  message: z.string(),
});

export const ContactSection = () => {
  const { t, locale } = useI18n();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { firstName, lastName, email, subject, message } = values;
    console.log(values);

    const mailToLink = `mailto:${siteConfig.contact.email}?subject=${subject}&body=Hello I am ${firstName} ${lastName}, my Email is ${email}. %0D%0A${message}`;

    window.location.href = mailToLink;
  }

  return (
    <section id="contact" className="container py-24 sm:py-32">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <h2 className="text-lg text-primary mb-2 tracking-wider">
              {t("contact.title")}
            </h2>

            <h2 className="text-3xl md:text-4xl font-bold">
              {t("contact.heading")}
            </h2>
          </div>
          <p className="mb-8 text-muted-foreground lg:w-5/6">
            {t("contact.desc")}
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <div className="flex gap-2 mb-1">
                <Building2 />
                <div className="font-bold">{t("contact.findUs")}</div>
              </div>

              <div>{pickSiteText(siteConfig.contact.address, locale)}</div>
            </div>

            <div>
              <div className="flex gap-2 mb-1">
                <Phone />
                <div className="font-bold">{t("contact.callUs")}</div>
              </div>

              <a
                href={`tel:${siteConfig.contact.phone}`}
                className="transition-colors hover:text-primary"
              >
                {siteConfig.contact.phoneDisplay}
              </a>
            </div>

            <div>
              <div className="flex gap-2 mb-1">
                <Mail />
                <div className="font-bold">{t("contact.mailUs")}</div>
              </div>

              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="transition-colors hover:text-primary"
              >
                {siteConfig.contact.email}
              </a>
            </div>

            <div>
              <div className="flex gap-2">
                <Clock />
                <div className="font-bold">{t("contact.visitUs")}</div>
              </div>

              <div>
                <div>
                  {pickSiteText(siteConfig.contact.hours.weekday, locale)}
                </div>
                <div>{pickSiteText(siteConfig.contact.hours.time, locale)}</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-muted/60 dark:bg-card">
          <CardHeader className="text-primary text-2xl"> </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid w-full gap-4"
              >
                <div className="flex flex-col md:!flex-row gap-8">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("contact.firstName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("contact.firstName")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>{t("contact.lastName")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("contact.lastName")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.email")}</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nama@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.subject")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("contact.subjectPlaceholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={t("contact.subjectGeneral")}>
                              {t("contact.subjectGeneral")}
                            </SelectItem>
                            <SelectItem value={t("contact.subjectGroup")}>
                              {t("contact.subjectGroup")}
                            </SelectItem>
                            <SelectItem value={t("contact.subjectCorporate")}>
                              {t("contact.subjectCorporate")}
                            </SelectItem>
                            <SelectItem value={t("contact.subjectOther")}>
                              {t("contact.subjectOther")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.message")}</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder={t("contact.messagePh")}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button className="mt-4">{t("contact.send")}</Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter></CardFooter>
        </Card>
      </section>
    </section>
  );
};
