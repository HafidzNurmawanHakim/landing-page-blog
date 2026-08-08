"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ImageUp,
  Languages,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PackageImage } from "@/components/package/package-image";
import ModalImageUploader from "@/components/ui/image-uploader";
import type { ImageUploadModalRef } from "@/components/ui/image-uploader/_types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  transportFormSchema,
  type TransportFormValues,
} from "@/lib/validations/transport";
import {
  createTransportProductAction,
  updateTransportProductAction,
} from "@/app/actions/transport";
import type { SerializedTransportProduct } from "@/lib/db/repositories/transport";
import {
  CURRENCIES,
  EXTRA_CHARGE_TYPES,
  PRICING_PACKAGE_TYPES,
  TRANSPORT_CATEGORIES,
  TRANSPORT_SERVICE_TYPES,
} from "@/lib/db/schema";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  type LocalizedString,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

const SERVICE_LABELS: Record<(typeof TRANSPORT_SERVICE_TYPES)[number], string> = {
  DRIVER_ONLY: "Driver Only",
  DRIVER_AND_GUIDE: "Driver & Guide",
  SELF_DRIVE: "Self Drive",
};

const PACKAGE_TYPE_LABELS: Record<(typeof PRICING_PACKAGE_TYPES)[number], string> = {
  HOURLY: "Per Jam (Hourly)",
  ONE_WAY: "1 Way Transfer",
};

const EXTRA_TYPE_LABELS: Record<(typeof EXTRA_CHARGE_TYPES)[number], string> = {
  LOCATION_SURCHARGE: "Surcharge Lokasi",
  EXTRA_HOUR: "Jam Tambahan",
};

type PricingRow = NonNullable<TransportFormValues["pricingPackages"]>[number];
type ExtraRow = NonNullable<TransportFormValues["extraCharges"]>[number];

function emptyPricingRow(): PricingRow {
  return {
    name: {},
    type: "HOURLY",
    durationHours: undefined,
    coveredAreas: [],
    price: 0,
    currency: "SGD",
  };
}

function emptyExtraRow(): ExtraRow {
  return {
    name: {},
    type: "LOCATION_SURCHARGE",
    price: 0,
    currency: "SGD",
    unit: "",
  };
}

function toLocalized(value: LocalizedString | null | undefined): LocalizedString {
  return value ?? {};
}

/** Guarantee an `id` value so the resolver's required `title.id` is satisfied. */
function toTitle(value?: LocalizedString): { id: string; ms?: string; en?: string; zh?: string } {
  return { ...toLocalized(value), id: value?.id ?? "" };
}

function toFormValues(
  product?: SerializedTransportProduct
): z.input<typeof transportFormSchema> {
  if (!product) {
    return {
      code: "",
      title: { id: "" },
      slug: "",
      category: "MPV",
      capacity: 6,
      capacityUnit: "Seaters",
      description: {},
      featuredImage: "",
      images: [],
      includedServices: ["DRIVER_ONLY"],
      pricingPackages: [emptyPricingRow()],
      extraCharges: [],
      isActive: 1,
    };
  }
  return {
    code: product.code,
    title: toTitle(product.title),
    slug: product.slug,
    category: product.category as TransportFormValues["category"],
    capacity: product.capacity,
    capacityUnit: product.capacityUnit,
    description: toLocalized(product.description),
    featuredImage: product.featuredImage ?? "",
    images: product.images ?? [],
    includedServices: product.includedServices,
    pricingPackages: product.pricingPackages.map((p) => ({
      name: toLocalized(p.name),
      type: p.type as PricingRow["type"],
      durationHours: p.durationHours ?? undefined,
      coveredAreas: p.coveredAreas ?? [],
      price: p.price,
      currency: p.currency as PricingRow["currency"],
    })),
    extraCharges: product.extraCharges.map((e) => ({
      name: toLocalized(e.name),
      type: e.type as ExtraRow["type"],
      price: e.price,
      currency: e.currency as ExtraRow["currency"],
      unit: e.unit ?? "",
    })),
    isActive: product.isActive,
  };
}

/** Extract a nested RHF array field error message (array index → field). */
function arrayFieldError(errors: unknown, index: number): string | undefined {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return undefined;
  }
  const entry = (errors as Record<string, unknown>)[String(index)];
  if (!entry || typeof entry !== "object") return undefined;
  const field = entry as { durationHours?: { message?: string } };
  return field.durationHours?.message;
}

export function TransportForm({
  product,
  mode,
}: {
  product?: SerializedTransportProduct;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const featuredRef = useRef<ImageUploadModalRef>(null);
  const galleryRef = useRef<ImageUploadModalRef>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<z.input<typeof transportFormSchema>, any, z.output<typeof transportFormSchema>>({
    resolver: zodResolver(transportFormSchema),
    defaultValues: toFormValues(product),
  });

  const slugValue = watch("slug") ?? "";
  const titleId = watch("title.id") ?? "";
  const pricingPackages = watch("pricingPackages") ?? [];
  const extraCharges = watch("extraCharges") ?? [];
  const images = watch("images") ?? [];
  const includedServices = watch("includedServices") ?? [];

  function autoSlug() {
    if (slugTouched) return;
    setValue("slug", slugify(titleId), { shouldValidate: true });
  }

  function slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function setPricing(list: PricingRow[]) {
    setValue("pricingPackages", list, { shouldValidate: true });
  }
  function setExtras(list: ExtraRow[]) {
    setValue("extraCharges", list, { shouldValidate: true });
  }

  function toggleService(service: (typeof TRANSPORT_SERVICE_TYPES)[number]) {
    const current = getValues("includedServices") ?? [];
    const next = current.includes(service)
      ? current.filter((s) => s !== service)
      : [...current, service];
    setValue("includedServices", next, { shouldValidate: true });
  }

  async function onSubmit(values: z.output<typeof transportFormSchema>) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = isEdit
        ? await updateTransportProductAction(product!.id, values)
        : await createTransportProductAction(values);

      if (!result.success) {
        setFormError(result.message);
        return;
      }
      router.push("/admin/transport");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan produk. Coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-6">
        {formError && (
          <div
            role="alert"
            className="mb-6 flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {formError}
          </div>
        )}

        {/* Locale tabs */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Languages className="h-4 w-4 text-muted-foreground" />
            Bahasa konten
            <span className="font-normal text-muted-foreground">
              — mengedit: {LOCALE_LABELS[activeLocale]}
            </span>
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
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="code" label="Kode Produk" error={errors.code?.message}>
              <Input
                id="code"
                placeholder="TR-MPV-6"
                aria-invalid={!!errors.code}
                className={cn("rounded-full", errors.code && "border-destructive")}
                {...register("code")}
              />
            </Field>
            <Field id="category" label="Kategori" error={errors.category?.message}>
              <Select
                value={watch("category")}
                onValueChange={(value) =>
                  setValue("category", value as TransportFormValues["category"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="category" className="rounded-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="capacity"
              label="Kapasitas"
              error={errors.capacity?.message}
            >
              <Input
                id="capacity"
                type="number"
                min={1}
                placeholder="6"
                aria-invalid={!!errors.capacity}
                className={cn("rounded-full", errors.capacity && "border-destructive")}
                {...register("capacity")}
              />
            </Field>
            <Field
              id="capacityUnit"
              label="Satuan Kapasitas"
              error={errors.capacityUnit?.message}
            >
              <Input
                id="capacityUnit"
                placeholder="Seaters"
                className={cn("rounded-full", errors.capacityUnit && "border-destructive")}
                {...register("capacityUnit")}
              />
            </Field>
          </div>

          <Field
            id="title"
            label="Nama Produk"
            hint="Wajib diisi setidaknya bahasa Indonesia (ID). Bahasa lain opsional."
            error={errors.title?.id?.message}
          >
            <Input
              id="title"
              placeholder="MPV 6 Seaters"
              aria-invalid={!!errors.title}
              className={cn("rounded-full", errors.title && "border-destructive")}
              {...register(`title.${activeLocale}`, {
                onBlur: activeLocale === "id" ? autoSlug : undefined,
              })}
            />
          </Field>

          <Field
            id="slug"
            label="Slug URL"
            hint="Kosongkan untuk membuat otomatis dari nama (ID)"
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              placeholder="mpv-6-seaters"
              value={slugValue}
              aria-invalid={!!errors.slug}
              className={cn("rounded-full", errors.slug && "border-destructive")}
              onFocus={() => setSlugTouched(true)}
              onChange={(e) => {
                setSlugTouched(true);
                setValue("slug", e.target.value, { shouldValidate: true });
              }}
            />
          </Field>

          <Field
            id="description"
            label="Deskripsi"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={4}
              placeholder="Deskripsi lengkap kendaraan..."
              aria-invalid={!!errors.description}
              className={cn(
                "rounded-3xl",
                errors.description && "border-destructive"
              )}
              {...register(`description.${activeLocale}`)}
            />
          </Field>

          {/* Included services */}
          <div className="space-y-2">
            <div>
              <Label>Layanan Termasuk</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Pilih minimal satu layanan pendukung kendaraan.
              </p>
            </div>
            {errors.includedServices && (
              <p className="text-sm text-destructive">
                {errors.includedServices.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_SERVICE_TYPES.map((service) => {
                const active = includedServices.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {SERVICE_LABELS[service]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured image */}
          <div className="space-y-2">
            <div>
              <Label>Gambar Utama</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Rasio 16:9 untuk hero. Upload dari perangkat atau tempel URL.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <PackageImage
                src={watch("featuredImage")}
                alt=""
                className="h-28 w-40 rounded-2xl"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => featuredRef.current?.open()}
                >
                  <ImageUp className="mr-2 h-4 w-4" />
                  Pilih / Upload
                </Button>
                {watch("featuredImage") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      setValue("featuredImage", "", { shouldValidate: true })
                    }
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>
            <ModalImageUploader
              ref={featuredRef}
              title="Upload Gambar Utama"
              description="Pilih gambar utama kendaraan (dipotong 16:9)."
              config={{
                maxFiles: 1,
                maxFileSize: 5,
                acceptedTypes: [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/avif",
                  "image/gif",
                ],
                enableCrop: true,
                cropAspectRatio: 16 / 9,
                enableCompression: true,
                compressionOptions: {
                  targetMaxSizeKB: 500,
                  maxWidth: 1600,
                  initialWebPQuality: 0.9,
                },
                enableMultiple: false,
              }}
              onUploadComplete={(images) => {
                const first = images[0];
                if (first) {
                  setValue("featuredImage", first.url, { shouldValidate: true });
                }
              }}
            />
            <Field id="featuredImage" label="URL Gambar Utama" error={errors.featuredImage?.message}>
              <Input
                id="featuredImage"
                placeholder="https://media.example.com/transport/mpv.jpg"
                className={cn(
                  "rounded-full",
                  errors.featuredImage && "border-destructive"
                )}
                {...register("featuredImage")}
              />
            </Field>
          </div>

          {/* Gallery images */}
          <div className="space-y-2">
            <div>
              <Label>Galeri Gambar</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Hingga 12 gambar. Upload beberapa sekaligus atau tempel URL.
              </p>
            </div>
            {images.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const next = [...images];
                    next[index] = e.target.value;
                    setValue("images", next, { shouldValidate: true });
                  }}
                  placeholder="https://media.example.com/transport/gallery.jpg"
                  className="rounded-full"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() =>
                    setValue(
                      "images",
                      images.filter((_, i) => i !== index),
                      { shouldValidate: true }
                    )
                  }
                  aria-label={`Hapus gambar ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => galleryRef.current?.open()}
              >
                <ImageUp className="mr-2 h-4 w-4" />
                Tambah Galeri
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setValue("images", [...images, ""], { shouldValidate: true })
                }
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Tambah URL kosong
              </Button>
            </div>
            <ModalImageUploader
              ref={galleryRef}
              title="Upload Galeri Kendaraan"
              description="Pilih beberapa gambar (rasio 4:3) untuk galeri kendaraan."
              config={{
                maxFiles: 12,
                maxFileSize: 5,
                acceptedTypes: [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/avif",
                  "image/gif",
                ],
                enableCrop: true,
                cropAspectRatio: 4 / 3,
                enableCompression: true,
                compressionOptions: {
                  targetMaxSizeKB: 500,
                  maxWidth: 1600,
                  initialWebPQuality: 0.9,
                },
                enableMultiple: true,
              }}
              onUploadComplete={(uploaded) => {
                const merged = [
                  ...images,
                  ...uploaded.map((img) => img.url).filter((u) => u.length > 0),
                ];
                setValue("images", merged.slice(0, 12), { shouldValidate: true });
              }}
            />
          </div>

          {/* Pricing packages */}
          <div className="space-y-3">
            <div>
              <Label>Paket Harga</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Durasi per jam (HOURLY) atau transfer satu arah (1 Way). Minimal
                satu paket. Harga dalam satuan penuh mata uang.
              </p>
            </div>
            {errors.pricingPackages && !Array.isArray(errors.pricingPackages) && (
              <p className="text-sm text-destructive">
                {errors.pricingPackages.message}
              </p>
            )}
            {pricingPackages.map((pkg, index) => (
              <div
                key={index}
                className="space-y-3 rounded-3xl border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Paket {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      setPricing(pricingPackages.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nama Paket ({LOCALE_LABELS[activeLocale]})</Label>
                    <Input
                      value={pkg.name[activeLocale] ?? ""}
                      onChange={(e) => {
                        const next = [...pricingPackages];
                        next[index] = {
                          ...next[index],
                          name: { ...next[index].name, [activeLocale]: e.target.value },
                        };
                        setPricing(next);
                      }}
                      placeholder="10 Hours Usage"
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipe</Label>
                    <Select
                      value={pkg.type}
                      onValueChange={(value) => {
                        const next = [...pricingPackages];
                        next[index] = {
                          ...next[index],
                          type: value as PricingRow["type"],
                        };
                        setPricing(next);
                      }}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_PACKAGE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {PACKAGE_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Durasi (jam)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={pkg.durationHours ?? ""}
                      onChange={(e) => {
                        const next = [...pricingPackages];
                        next[index] = {
                          ...next[index],
                          durationHours:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        };
                        setPricing(next);
                      }}
                      placeholder={pkg.type === "HOURLY" ? "10" : "-"}
                      disabled={pkg.type !== "HOURLY"}
                      className="rounded-full"
                    />
                    {arrayFieldError(errors.pricingPackages, index) && (
                      <p className="text-sm text-destructive">
                        {arrayFieldError(errors.pricingPackages, index)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Harga</Label>
                    <Input
                      type="number"
                      min={1}
                      value={pkg.price || ""}
                      onChange={(e) => {
                        const next = [...pricingPackages];
                        next[index] = {
                          ...next[index],
                          price: Number(e.target.value),
                        };
                        setPricing(next);
                      }}
                      placeholder="100"
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mata Uang</Label>
                    <Select
                      value={pkg.currency}
                      onValueChange={(value) => {
                        const next = [...pricingPackages];
                        next[index] = {
                          ...next[index],
                          currency: value as PricingRow["currency"],
                        };
                        setPricing(next);
                      }}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Area Cakupan</Label>
                  <Input
                    value={(pkg.coveredAreas ?? []).join(", ")}
                    onChange={(e) => {
                      const next = [...pricingPackages];
                      next[index] = {
                        ...next[index],
                        coveredAreas: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter((a) => a.length > 0),
                      };
                      setPricing(next);
                    }}
                    placeholder="Batam Centre, Nagoya, Nongsa"
                    className="rounded-full"
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setPricing([...pricingPackages, emptyPricingRow()])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Paket Harga
            </Button>
          </div>

          {/* Extra charges */}
          <div className="space-y-3">
            <div>
              <Label>Biaya Tambahan</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Opsional. Surcharge lokasi atau jam tambahan yang dikenakan.
              </p>
            </div>
            {extraCharges.map((extra, index) => (
              <div
                key={index}
                className="space-y-3 rounded-3xl border border-border/60 bg-muted/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Biaya {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      setExtras(extraCharges.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Hapus
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nama ({LOCALE_LABELS[activeLocale]})</Label>
                    <Input
                      value={extra.name[activeLocale] ?? ""}
                      onChange={(e) => {
                        const next = [...extraCharges];
                        next[index] = {
                          ...next[index],
                          name: { ...next[index].name, [activeLocale]: e.target.value },
                        };
                        setExtras(next);
                      }}
                      placeholder="Additional Charge Enter Barelang"
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipe</Label>
                    <Select
                      value={extra.type}
                      onValueChange={(value) => {
                        const next = [...extraCharges];
                        next[index] = {
                          ...next[index],
                          type: value as ExtraRow["type"],
                        };
                        setExtras(next);
                      }}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXTRA_CHARGE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {EXTRA_TYPE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label>Harga</Label>
                    <Input
                      type="number"
                      min={1}
                      value={extra.price || ""}
                      onChange={(e) => {
                        const next = [...extraCharges];
                        next[index] = { ...next[index], price: Number(e.target.value) };
                        setExtras(next);
                      }}
                      placeholder="10"
                      className="rounded-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mata Uang</Label>
                    <Select
                      value={extra.currency}
                      onValueChange={(value) => {
                        const next = [...extraCharges];
                        next[index] = {
                          ...next[index],
                          currency: value as ExtraRow["currency"],
                        };
                        setExtras(next);
                      }}
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Satuan</Label>
                    <Input
                      value={extra.unit ?? ""}
                      onChange={(e) => {
                        const next = [...extraCharges];
                        next[index] = { ...next[index], unit: e.target.value };
                        setExtras(next);
                      }}
                      placeholder="per entry / per hour"
                      className="rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={() => setExtras([...extraCharges, emptyExtraRow()])}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Biaya Tambahan
            </Button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="isActive"
              label="Status"
              error={errors.isActive?.message}
            >
              <Select
                value={String(watch("isActive"))}
                onValueChange={(value) =>
                  setValue("isActive", Number(value), { shouldValidate: true })
                }
              >
                <SelectTrigger id="isActive" className="rounded-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Aktif</SelectItem>
                  <SelectItem value="0">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              className="rounded-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-4 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Buat Produk"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="rounded-full"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
