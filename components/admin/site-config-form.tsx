"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  Languages,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  siteConfigSchema,
  type SiteConfigFormValues,
} from "@/lib/validations/site-config";
import { updateSiteConfigAction } from "@/app/actions/site-config";
import type { ResolvedSiteConfig } from "@/lib/services/site-config";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  type LocalizedString,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { humanizeError } from "@/lib/utils/errors";

function fillLocalized(value: LocalizedString): Record<Locale, string> {
  const out = { id: "", ms: "", en: "", zh: "" } as Record<Locale, string>;
  for (const code of LOCALES) {
    const v = value[code];
    if (v && v.trim()) out[code] = v.trim();
  }
  return out;
}

export function SiteConfigForm({ config }: { config: ResolvedSiteConfig }) {
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<z.input<typeof siteConfigSchema>, any, z.output<typeof siteConfigSchema>>({
    resolver: zodResolver(siteConfigSchema),
    defaultValues: {
      contactPhone: config.contact.phone,
      contactPhoneDisplay: config.contact.phoneDisplay,
      contactEmail: config.contact.email,
      whatsappNumbers: config.whatsappNumbers.map((w) => ({
        label: w.label,
        number: w.number,
      })),
      adminEmail: config.adminEmail,
      address: fillLocalized(config.contact.address),
      hoursWeekday: fillLocalized(config.contact.hours.weekday),
      hoursTime: fillLocalized(config.contact.hours.time),
      social: config.social.map((s) => ({ label: s.label, href: s.href })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "social",
  });

  const waFields = useFieldArray({
    control,
    name: "whatsappNumbers",
  });

  async function onSubmit(values: SiteConfigFormValues) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = await updateSiteConfigAction(values);
      if (!result.success) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success("Konfigurasi berhasil disimpan.");
      router.refresh();
    } catch (err) {
      const message = humanizeError(err, "Gagal menyimpan konfigurasi. Coba lagi.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {formError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}

      {/* Kontak */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">Kontak</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contactPhoneDisplay">
              Nomor yang ditampilkan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPhoneDisplay"
              placeholder="+62 819 4143 433"
              aria-invalid={!!errors.contactPhoneDisplay}
              className={cn(
                "rounded-full",
                errors.contactPhoneDisplay && "border-destructive"
              )}
              {...register("contactPhoneDisplay")}
            />
            {errors.contactPhoneDisplay && (
              <p className="text-sm text-destructive">
                {errors.contactPhoneDisplay.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">
              Nomor telepon (untuk tel:) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contactPhone"
              placeholder="+628194143343"
              aria-invalid={!!errors.contactPhone}
              className={cn("rounded-full", errors.contactPhone && "border-destructive")}
              {...register("contactPhone")}
            />
            {errors.contactPhone && (
              <p className="text-sm text-destructive">{errors.contactPhone.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">
            Email kontak <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contactEmail"
            placeholder="halo@destitour.id"
            type="email"
            aria-invalid={!!errors.contactEmail}
            className={cn("rounded-full", errors.contactEmail && "border-destructive")}
            {...register("contactEmail")}
          />
          {errors.contactEmail && (
            <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
          )}
        </div>
      </section>

      {/* WhatsApp & Notifikasi */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            WhatsApp & Notifikasi Admin
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full"
            disabled={waFields.fields.length >= 5}
            onClick={() => waFields.append({ label: "", number: "" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Nomor
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Nomor WhatsApp admin. Bisa lebih dari satu untuk beda negara — isi
          label dengan nama atau emoji bendera (contoh: 🇮🇩 atau 🇲🇾).
        </p>
        {waFields.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada nomor WhatsApp. Klik &quot;Tambah Nomor&quot;.
          </p>
        ) : (
          <div className="space-y-3">
            {waFields.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1.5fr_auto] items-start gap-3 rounded-3xl bg-secondary/50 p-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={`whatsappNumbers.${index}.label`}>Label</Label>
                  <Input
                    id={`whatsappNumbers.${index}.label`}
                    placeholder="Indonesia / 🇮🇩"
                    className="rounded-full"
                    aria-invalid={!!errors.whatsappNumbers?.[index]?.label}
                    {...register(`whatsappNumbers.${index}.label`)}
                  />
                  {errors.whatsappNumbers?.[index]?.label && (
                    <p className="text-sm text-destructive">
                      {errors.whatsappNumbers[index].label.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`whatsappNumbers.${index}.number`}>
                    Nomor
                  </Label>
                  <Input
                    id={`whatsappNumbers.${index}.number`}
                    placeholder="628194143343"
                    inputMode="numeric"
                    className="rounded-full"
                    aria-invalid={!!errors.whatsappNumbers?.[index]?.number}
                    {...register(`whatsappNumbers.${index}.number`)}
                  />
                  {errors.whatsappNumbers?.[index]?.number && (
                    <p className="text-sm text-destructive">
                      {errors.whatsappNumbers[index].number.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-7 rounded-full"
                  onClick={() => waFields.remove(index)}
                  aria-label="Hapus nomor WhatsApp"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        {errors.whatsappNumbers?.root && (
          <p className="text-sm text-destructive">
            {errors.whatsappNumbers.root.message}
          </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="adminEmail">
            Email admin (notifikasi booking) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="adminEmail"
            type="email"
            placeholder="manager@destitours.com"
            aria-invalid={!!errors.adminEmail}
            className={cn("rounded-full", errors.adminEmail && "border-destructive")}
            {...register("adminEmail")}
          />
          {errors.adminEmail && (
            <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
          )}
        </div>
      </section>

      {/* Sosial Media */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">Sosial Media</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-full"
            onClick={() => append({ label: "", href: "" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sosial Media
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada sosial media. Klik &quot;Tambah Sosial Media&quot;.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1.5fr_auto] items-start gap-3 rounded-3xl bg-secondary/50 p-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={`social.${index}.label`}>Label</Label>
                  <Input
                    id={`social.${index}.label`}
                    placeholder="Instagram"
                    className="rounded-full"
                    aria-invalid={!!errors.social?.[index]?.label}
                    {...register(`social.${index}.label`)}
                  />
                  {errors.social?.[index]?.label && (
                    <p className="text-sm text-destructive">
                      {errors.social[index].label.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`social.${index}.href`}>URL</Label>
                  <Input
                    id={`social.${index}.href`}
                    placeholder="https://instagram.com/destitour"
                    className="rounded-full"
                    aria-invalid={!!errors.social?.[index]?.href}
                    {...register(`social.${index}.href`)}
                  />
                  {errors.social?.[index]?.href && (
                    <p className="text-sm text-destructive">
                      {errors.social[index].href.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-7 rounded-full"
                  onClick={() => remove(index)}
                  aria-label="Hapus sosial media"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Alamat & Jam */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Alamat & Jam Operasional
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <Languages className="h-4 w-4 text-muted-foreground" />
          Bahasa — mengedit: {LOCALE_LABELS[activeLocale]}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLocale(code)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeLocale === code
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              )}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat</Label>
          <Input
            id="address"
            placeholder="Batam Center, Batam, Kepulauan Riau"
            className="rounded-full"
            {...register(`address.${activeLocale}`)}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hoursWeekday">Hari Operasional</Label>
            <Input
              id="hoursWeekday"
              placeholder="Senin - Jumat"
              className="rounded-full"
              {...register(`hoursWeekday.${activeLocale}`)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursTime">Jam Operasional</Label>
            <Input
              id="hoursTime"
              placeholder="08.00 - 16.00"
              className="rounded-full"
              {...register(`hoursTime.${activeLocale}`)}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" size="lg" className="rounded-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Konfigurasi"
          )}
        </Button>
      </div>
    </form>
  );
}
