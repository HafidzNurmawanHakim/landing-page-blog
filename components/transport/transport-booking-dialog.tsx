"use client";

import { forwardRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enUS, id, ms, zhCN, type Locale as DateFnsLocale } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import ModalDrawer, {
  type ReusableModalRef,
} from "@/components/ui/modal-drawer";
import { createBooking } from "@/app/actions/booking";
import {
  transportBookingFormSchema,
  type TransportBookingFormValues,
} from "@/lib/validations/booking";
import type { LocalizedTransportProduct } from "@/lib/db/repositories/transport";
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useI18n } from "@/lib/i18n/provider";
import { buildWhatsAppLink } from "@/lib/config/site";
import { useSiteConfig } from "@/lib/hooks/use-site-config";
import { WhatsAppIcon } from "@/components/layout/whatsapp-button";

type SelectedPackage = LocalizedTransportProduct["pricingPackages"][number];
type SelectedExtra = LocalizedTransportProduct["extraCharges"][number];

type Props = {
  product: LocalizedTransportProduct;
  selectedPackage: SelectedPackage;
  selectedExtras: SelectedExtra[];
};

type SuccessBooking = {
  bookingCode: string;
  packageName: string;
  date: string;
  total: string;
};

function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

const dateLocales: Record<string, DateFnsLocale> = {
  id,
  en: enUS,
  ms,
  zh: zhCN,
};

export const TransportBookingDialog = forwardRef<ReusableModalRef, Props>(
  function TransportBookingDialog({ product, selectedPackage, selectedExtras }, ref) {
    const router = useRouter();
    const { t, locale } = useI18n();
    const { config } = useSiteConfig();
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
      getValues,
      formState: { errors },
    } = useForm<TransportBookingFormValues>({
      resolver: zodResolver(transportBookingFormSchema),
      mode: "onTouched",
      defaultValues: {
        vehicleQty: 1,
      },
    });

    const required = watch();
    const isComplete = Boolean(
      (required.customerName ?? "").trim().length >= 3 &&
        (required.phone ?? "").trim().length >= 9 &&
        required.pickupDate &&
        required.pickupTime &&
        (required.pickupLocation ?? "").trim().length >= 2
    );

    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const unitTotal = selectedPackage.price + extrasTotal;

    function buildWhatsAppHref() {
      const v = getValues();
      const qty = v.vehicleQty > 0 ? v.vehicleQty : 1;
      const lines = [
        t("wa.bookingIntro"),
        "",
        `📌 *${t("transport.bookingTitle")}:*`,
        `• *${t("booking.package")}:* ${product.title}`,
        `• *${t("transport.pricingPackages")}:* ${selectedPackage.name}`,
      ];
      for (const extra of selectedExtras) {
        lines.push(
          `• *${extra.name}:* +${formatCurrency(extra.price, extra.currency)}`
        );
      }
      lines.push(
        `• *${t("transport.estimatedTotal")}:* ${formatCurrency(
          unitTotal * qty,
          selectedPackage.currency
        )}`,
        `• *${t("transport.pickupDate")}:* ${formatDate(v.pickupDate)}`,
        `• *${t("transport.pickupTime")}:* ${v.pickupTime}`,
        `• *${t("transport.pickupLocation")}:* ${v.pickupLocation}`
      );
      if (v.dropoffLocation) {
        lines.push(
          `• *${t("transport.dropoffLocation")}:* ${v.dropoffLocation}`
        );
      }
      lines.push(
        `• *${t("transport.vehicleQty")}:* ${v.vehicleQty}`,
        `• *${t("booking.customerName")}:* ${v.customerName}`,
        `• *${t("booking.phone")}:* ${v.phone}`
      );
      if (v.email) lines.push(`• *${t("booking.email")}:* ${v.email}`);
      if (v.notes) lines.push(`• *${t("booking.notes")}:* ${v.notes}`);
      lines.push("", t("wa.bookingOutro"));
      return buildWhatsAppLink(config.whatsapp, locale, lines.join("\n"));
    }

    function resetAll() {
      reset({
        customerName: "",
        phone: "",
        email: "",
        pickupDate: "",
        pickupTime: "",
        pickupLocation: "",
        dropoffLocation: "",
        vehicleQty: 1,
        notes: "",
      });
      setFormError(null);
      setIsSubmitting(false);
      setStep("form");
      setSuccessBooking(null);
    }

    async function onSubmit(values: TransportBookingFormValues) {
      setIsSubmitting(true);
      setFormError(null);

      try {
        const result = await createBooking({
          packageCode: product.code,
          locale,
          itemType: "transport",
          customerName: values.customerName,
          phone: values.phone,
          email: values.email || undefined,
          departureDate: values.pickupDate,
          returnDate: values.pickupDate,
          participants: values.vehicleQty,
          notes: values.notes,
          bookingOptions: {
            pricingPackageId: selectedPackage.id,
            extraChargeIds: selectedExtras.map((e) => e.id),
            vehicleQty: values.vehicleQty,
            pickupDate: values.pickupDate,
            pickupTime: values.pickupTime,
            pickupLocation: values.pickupLocation,
            dropoffLocation: values.dropoffLocation || "",
          },
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

        const total =
          unitTotal *
          (values.vehicleQty > 0 ? values.vehicleQty : 1);
        setSuccessBooking({
          bookingCode: result.bookingCode,
          packageName: product.title,
          date: values.pickupDate,
          total: formatCurrency(total, selectedPackage.currency),
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
        title={step === "form" ? t("transport.bookingTitle") : t("success.title")}
        onClose={resetAll}
      >
        {(handleClose) =>
          step === "form" ? (
            <>
              <div className="px-4 text-left sm:px-6">
                <p className="text-sm text-muted-foreground">
                  {t("booking.package")}:{" "}
                  <span className="font-medium text-foreground">
                    {product.title}
                  </span>{" "}
                  · {selectedPackage.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {t("transport.estimatedTotal")}:{" "}
                  {formatCurrency(unitTotal, selectedPackage.currency)}
                  {selectedPackage.durationHours
                    ? ` (${selectedPackage.durationHours}h)`
                    : ""}
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
                      <Label>{t("transport.pickupDate")}</Label>
                      <Controller
                        control={control}
                        name="pickupDate"
                        render={({ field }) => (
                          <DatePicker
                            id="pickupDate"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={t("booking.datePicker")}
                            minDate={today()}
                            locale={dateLocale}
                            error={!!errors.pickupDate}
                          />
                        )}
                      />
                      {errors.pickupDate && (
                        <p className="text-sm text-destructive">
                          {errors.pickupDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pickupTime">
                        {t("transport.pickupTime")}
                      </Label>
                      <Input
                        id="pickupTime"
                        type="time"
                        aria-invalid={!!errors.pickupTime}
                        className={cn(
                          "rounded-full",
                          errors.pickupTime && "border-destructive"
                        )}
                        {...register("pickupTime")}
                      />
                      {errors.pickupTime && (
                        <p className="text-sm text-destructive">
                          {errors.pickupTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation">
                        {t("transport.pickupLocation")}
                      </Label>
                      <Input
                        id="pickupLocation"
                        placeholder="Hang Nadim Airport"
                        aria-invalid={!!errors.pickupLocation}
                        className={cn(
                          "rounded-full",
                          errors.pickupLocation && "border-destructive"
                        )}
                        {...register("pickupLocation")}
                      />
                      {errors.pickupLocation && (
                        <p className="text-sm text-destructive">
                          {errors.pickupLocation.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dropoffLocation">
                        {t("transport.dropoffLocation")}
                      </Label>
                      <Input
                        id="dropoffLocation"
                        placeholder={t("transport.dropoffPh")}
                        aria-invalid={!!errors.dropoffLocation}
                        className={cn(
                          "rounded-full",
                          errors.dropoffLocation && "border-destructive"
                        )}
                        {...register("dropoffLocation")}
                      />
                      {errors.dropoffLocation && (
                        <p className="text-sm text-destructive">
                          {errors.dropoffLocation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vehicleQty">
                      {t("transport.vehicleQty")}
                    </Label>
                    <Input
                      id="vehicleQty"
                      type="number"
                      min={1}
                      max={20}
                      aria-invalid={!!errors.vehicleQty}
                      className={cn(
                        "rounded-full",
                        errors.vehicleQty && "border-destructive"
                      )}
                      {...register("vehicleQty", { valueAsNumber: true })}
                    />
                    {errors.vehicleQty && (
                      <p className="text-sm text-destructive">
                        {errors.vehicleQty.message}
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl bg-secondary p-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">
                        {selectedPackage.name}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(selectedPackage.price, selectedPackage.currency)}
                      </span>
                    </div>
                    {selectedExtras.map((extra) => (
                      <div
                        key={extra.id}
                        className="mt-1 flex items-center justify-between gap-4"
                      >
                        <span className="text-muted-foreground">
                          {extra.name}
                          {extra.unit ? ` (${extra.unit})` : ""}
                        </span>
                        <span className="font-medium">
                          +{formatCurrency(extra.price, extra.currency)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">{t("booking.notes")}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t("booking.notesPh")}
                      className={cn("rounded-3xl", errors.notes && "border-destructive")}
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
                    disabled={!isComplete || isSubmitting}
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

                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-border/60" />
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("booking.or")}
                    </span>
                    <span className="h-px flex-1 bg-border/60" />
                  </div>

                  <button
                    type="button"
                    disabled={!isComplete}
                    onClick={() =>
                      window.open(
                        buildWhatsAppHref(),
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1eb65c] disabled:cursor-not-allowed disabled:bg-[#25D366]/40 disabled:text-white/70"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    {t("wa.bookingVia")}
                  </button>
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
                      {formatDate(successBooking.date)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">
                      {t("transport.estimatedTotal")}
                    </dt>
                    <dd className="font-medium">{successBooking.total}</dd>
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
                  router.push("/transport");
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
