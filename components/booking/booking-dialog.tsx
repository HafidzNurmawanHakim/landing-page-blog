"use client";

import { forwardRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enUS, id, ms, zhCN, type Locale } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker, parseISODate } from "@/components/ui/date-picker";
import ModalDrawer, {
  type ReusableModalRef,
} from "@/components/ui/modal-drawer";
import { createBooking } from "@/app/actions/booking";
import {
  bookingFormSchema,
  type BookingFormValues,
} from "@/lib/validations/booking";
import { cn } from "@/lib/utils";
import { formatDate, formatIDR } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";

type BookingDialogProps = {
  pkg: { code: string; name: string; price: number };
};

type SuccessBooking = {
  bookingCode: string;
  packageName: string;
  departureDate: string;
  returnDate: string;
  participants: number;
};

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const dateLocales: Record<string, Locale> = {
  id,
  en: enUS,
  ms,
  zh: zhCN,
};

export const BookingDialog = forwardRef<ReusableModalRef, BookingDialogProps>(
  function BookingDialog({ pkg }, ref) {
    const router = useRouter();
    const { t, locale } = useI18n();
    const dateLocale = dateLocales[locale] ?? id;
    const [step, setStep] = useState<"form" | "success">("form");
    const [successBooking, setSuccessBooking] =
      useState<SuccessBooking | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const {
      register,
      control,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm<BookingFormValues>({
      resolver: zodResolver(bookingFormSchema),
      defaultValues: {
        participants: 2,
      },
    });

    const departureDate = watch("departureDate");

    function resetAll() {
      reset({
        customerName: "",
        phone: "",
        email: "",
        departureDate: "",
        returnDate: "",
        participants: 2,
        notes: "",
      });
      setFormError(null);
      setIsSubmitting(false);
      setStep("form");
      setSuccessBooking(null);
    }

    async function onSubmit(values: BookingFormValues) {
      setIsSubmitting(true);
      setFormError(null);

      try {
        const result = await createBooking({
          ...values,
          packageCode: pkg.code,
          locale,
        });

        if (!result.success) {
          if ("errors" in result) {
            const first = result.errors[0];
            setFormError(
              first ? `Validasi gagal: ${first.message}` : t("booking.invalid")
            );
          } else {
            setFormError(result.message);
          }
          return;
        }

        setSuccessBooking({
          bookingCode: result.bookingCode,
          packageName: pkg.name,
          departureDate: values.departureDate,
          returnDate: values.returnDate,
          participants: values.participants,
        });
        setStep("success");
      } catch (err) {
        setFormError(
          err instanceof Error ? err.message : t("booking.genericError")
        );
      } finally {
        setIsSubmitting(false);
      }
    }

    return (
      <ModalDrawer
        ref={ref}
        title={step === "form" ? t("booking.title") : t("success.title")}
        onClose={resetAll}
      >
        {(handleClose) =>
          step === "form" ? (
            <>
              <div className="px-4 text-left sm:px-6">
                <p className="text-sm text-muted-foreground">
                  {t("booking.package")}:{" "}
                  <span className="font-medium text-foreground">{pkg.name}</span>{" "}
                  · {formatIDR(pkg.price)}
                </p>
              </div>

              <div className="space-y-5 px-4 py-4 sm:px-6">
                {formError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="customerName">
                      {t("booking.customerName")}
                    </Label>
                    <Input
                      id="customerName"
                      placeholder={t("booking.customerNamePh")}
                      aria-invalid={!!errors.customerName}
                      className={cn(
                        "rounded-full",
                        errors.customerName && "border-destructive"
                      )}
                      {...register("customerName")}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("booking.phone")}</Label>
                      <Input
                        id="phone"
                        placeholder="08123456789"
                        aria-invalid={!!errors.phone}
                        className={cn(
                          "rounded-full",
                          errors.phone && "border-destructive"
                        )}
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("booking.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("booking.emailPh")}
                        aria-invalid={!!errors.email}
                        className={cn(
                          "rounded-full",
                          errors.email && "border-destructive"
                        )}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("booking.departureDate")}</Label>
                      <Controller
                        control={control}
                        name="departureDate"
                        render={({ field }) => (
                          <DatePicker
                            id="departureDate"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t("booking.datePicker")}
                            minDate={today()}
                            locale={dateLocale}
                            error={!!errors.departureDate}
                          />
                        )}
                      />
                      {errors.departureDate && (
                        <p className="text-sm text-destructive">
                          {errors.departureDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("booking.returnDate")}</Label>
                      <Controller
                        control={control}
                        name="returnDate"
                        render={({ field }) => (
                          <DatePicker
                            id="returnDate"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t("booking.datePicker")}
                            minDate={
                              departureDate ? parseISODate(departureDate) : today()
                            }
                            locale={dateLocale}
                            error={!!errors.returnDate}
                          />
                        )}
                      />
                      {errors.returnDate && (
                        <p className="text-sm text-destructive">
                          {errors.returnDate.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="participants">
                      {t("booking.participants")}
                    </Label>
                    <Input
                      id="participants"
                      type="number"
                      min={1}
                      max={50}
                      aria-invalid={!!errors.participants}
                      className={cn(
                        "rounded-full",
                        errors.participants && "border-destructive"
                      )}
                      {...register("participants", { valueAsNumber: true })}
                    />
                    {errors.participants && (
                      <p className="text-sm text-destructive">
                        {errors.participants.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("booking.notes")}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t("booking.notesPh")}
                      className={cn(
                        "rounded-3xl",
                        errors.notes && "border-destructive"
                      )}
                      {...register("notes")}
                    />
                    {errors.notes && (
                      <p className="text-sm text-destructive">
                        {errors.notes.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("booking.processing")}
                      </>
                    ) : (
                      t("booking.submit")
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : successBooking ? (
            <div className="px-4 py-4 text-center sm:px-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-9 w-9 text-primary" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("success.desc")}
              </p>

              <div className="mt-6 rounded-3xl bg-secondary p-6 text-left">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {t("success.bookingCode")}
                    </dt>
                    <dd className="font-semibold tracking-wide">
                      {successBooking.bookingCode}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {t("success.package")}
                    </dt>
                    <dd className="text-right font-medium">
                      {successBooking.packageName}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {t("success.date")}
                    </dt>
                    <dd className="font-medium">
                      {formatDate(successBooking.departureDate)} —{" "}
                      {formatDate(successBooking.returnDate)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {t("success.participants")}
                    </dt>
                    <dd className="font-medium">
                      {successBooking.participants} {t("success.people")}
                    </dd>
                  </div>
                </dl>
              </div>

              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("success.saveNote")}
              </p>

              <Button
                size="lg"
                className="mt-6 w-full rounded-full"
                onClick={() => {
                  handleClose();
                  router.push("/packages");
                }}
              >
                {t("success.morePackages")}
              </Button>
            </div>
          ) : null
        }
      </ModalDrawer>
    );
  }
);
