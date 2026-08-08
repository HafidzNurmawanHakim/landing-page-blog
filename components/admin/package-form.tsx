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
  packageFormSchema,
  type PackageFormValues,
} from "@/lib/validations/packages";
import {
  createPackageAction,
  updatePackageAction,
} from "@/app/actions/packages";
import type { SerializedPackage } from "@/lib/db/repositories/packages";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  type LocalizedList,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type StringList = { value: string }[];

function toList(items: string[] | undefined): StringList {
  return (items ?? []).map((value) => ({ value }));
}

function fromList(list: StringList): string[] {
  return list
    .map((item) => item.value.trim())
    .filter((value) => value.length > 0);
}

function toLocaleLists(items?: LocalizedList): Record<Locale, StringList> {
  const out = {} as Record<Locale, StringList>;
  for (const code of LOCALES) out[code] = toList(items?.[code]);
  return out;
}

function toLocalizedList(
  map: Record<Locale, StringList>
): LocalizedList {
  const out: LocalizedList = {};
  for (const code of LOCALES) {
    const cleaned = fromList(map[code]);
    if (cleaned.length > 0) out[code] = cleaned;
  }
  return out;
}

export function PackageForm({
  pkg,
  mode,
}: {
  pkg?: SerializedPackage;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const uploaderRef = useRef<ImageUploadModalRef>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<Record<Locale, StringList>>(() =>
    toLocaleLists(pkg?.itinerary)
  );
  const [includes, setIncludes] = useState<Record<Locale, StringList>>(() =>
    toLocaleLists(pkg?.includes)
  );
  const [excludes, setExcludes] = useState<Record<Locale, StringList>>(() =>
    toLocaleLists(pkg?.excludes)
  );
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof packageFormSchema>, any, z.output<typeof packageFormSchema>>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      code: pkg?.code ?? "",
      name: pkg?.name ?? {},
      slug: pkg?.slug ?? "",
      category: (pkg?.category as PackageFormValues["category"]) ?? "tour",
      duration: pkg?.duration ?? "",
      price: pkg?.price ?? 0,
      description: pkg?.description ?? {},
      imageUrl: pkg?.imageUrl ?? "",
      imageAlt: pkg?.imageAlt ?? {},
      isActive: pkg?.isActive ?? 1,
    },
  });

  const slugValue = watch("slug") ?? "";
  const nameValue = watch("name.id") ?? "";

  function autoSlug() {
    if (slugTouched) return;
    setValue("slug", slugify(nameValue), { shouldValidate: true });
  }

  function slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateList(
    setter: React.Dispatch<React.SetStateAction<Record<Locale, StringList>>>,
    locale: Locale,
    index: number,
    value: string
  ) {
    setter((prev) => ({
      ...prev,
      [locale]: prev[locale].map((item, i) => (i === index ? { value } : item)),
    }));
  }

  function removeList(
    setter: React.Dispatch<React.SetStateAction<Record<Locale, StringList>>>,
    locale: Locale,
    index: number
  ) {
    setter((prev) => ({
      ...prev,
      [locale]: prev[locale].filter((_, i) => i !== index),
    }));
  }

  function addList(
    setter: React.Dispatch<React.SetStateAction<Record<Locale, StringList>>>,
    locale: Locale
  ) {
    setter((prev) => ({ ...prev, [locale]: [...prev[locale], { value: "" }] }));
  }

  async function onSubmit(values: z.output<typeof packageFormSchema>) {
    setIsSubmitting(true);
    setFormError(null);

    const payload: PackageFormValues = {
      ...values,
      itinerary: toLocalizedList(itinerary),
      includes: toLocalizedList(includes),
      excludes: toLocalizedList(excludes),
    };

    try {
      const result = isEdit
        ? await updatePackageAction(pkg!.id, payload)
        : await createPackageAction(payload);

      if (!result.success) {
        setFormError(result.message);
        return;
      }
      router.push("/admin/packages");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Gagal menyimpan paket. Coba lagi."
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

        {/* Locale tabs for translated content */}
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
            <Field
              id="code"
              label="Kode Paket"
              error={errors.code?.message}
            >
              <Input
                id="code"
                placeholder="BATAM-3D2N"
                aria-invalid={!!errors.code}
                className={cn("rounded-full", errors.code && "border-destructive")}
                {...register("code")}
              />
            </Field>
            <Field id="category" label="Kategori" error={errors.category?.message}>
              <Select
                value={watch("category")}
                onValueChange={(value) =>
                  setValue(
                    "category",
                    value as PackageFormValues["category"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger id="category" className="rounded-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tour">Tour</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field
            id="name"
            label="Nama Paket"
            hint="Wajib diisi setidaknya bahasa Indonesia (ID). Bahasa lain opsional."
            error={errors.name?.id?.message}
          >
            <Input
              id="name"
              placeholder="Batam 3 Hari 2 Malam"
              aria-invalid={!!errors.name}
              className={cn("rounded-full", errors.name && "border-destructive")}
              {...register(`name.${activeLocale}`, { onBlur: activeLocale === "id" ? autoSlug : undefined })}
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
              placeholder="batam-3d2n"
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

          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="duration" label="Durasi" error={errors.duration?.message}>
              <Input
                id="duration"
                placeholder="3D2N"
                className={cn("rounded-full", errors.duration && "border-destructive")}
                {...register("duration")}
              />
            </Field>
            <Field id="price" label="Harga (Rp)" error={errors.price?.message}>
              <Input
                id="price"
                type="number"
                min={1}
                placeholder="1850000"
                aria-invalid={!!errors.price}
                className={cn("rounded-full", errors.price && "border-destructive")}
                {...register("price")}
              />
            </Field>
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

          <Field
            id="description"
            label="Deskripsi"
            error={errors.description?.message}
          >
            <Textarea
              id="description"
              rows={4}
              placeholder="Deskripsi lengkap paket..."
              aria-invalid={!!errors.description}
              className={cn(
                "rounded-3xl",
                errors.description && "border-destructive"
              )}
              {...register(`description.${activeLocale}`)}
            />
          </Field>

          <div className="space-y-2">
            <div>
              <Label>Gambar Paket</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload dari perangkat atau tempel URL gambar. Gambar dikompres
                otomatis ke WebP (maks ±500 KB) dan bisa dipotong sebelum upload.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <PackageImage
                src={watch("imageUrl")}
                alt=""
                className="h-28 w-40 rounded-2xl"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => uploaderRef.current?.open()}
                >
                  <ImageUp className="mr-2 h-4 w-4" />
                  Pilih / Upload Gambar
                </Button>
                {watch("imageUrl") && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      setValue("imageUrl", "", { shouldValidate: true })
                    }
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>

            <ModalImageUploader
              ref={uploaderRef}
              title="Upload Gambar Paket"
              description="Pilih gambar untuk paket. Gambar otomatis dikompres ke WebP dan bisa dipotong."
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
                  setValue("imageUrl", first.url, { shouldValidate: true });
                }
              }}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="imageUrl"
              label="URL Gambar"
              error={errors.imageUrl?.message}
            >
              <Input
                id="imageUrl"
                placeholder="https://media.example.com/packages/abc.jpg"
                aria-invalid={!!errors.imageUrl}
                className={cn(
                  "rounded-full",
                  errors.imageUrl && "border-destructive"
                )}
                {...register("imageUrl")}
              />
            </Field>
            <Field
              id="imageAlt"
              label="Teks Alt"
              hint="Per-locale, untuk aksesibilitas & SEO"
              error={errors.imageAlt?.message}
            >
              <Input
                id="imageAlt"
                placeholder="Deskripsi singkat gambar"
                className={cn("rounded-full", errors.imageAlt && "border-destructive")}
                {...register(`imageAlt.${activeLocale}`)}
              />
            </Field>
          </div>

          <StringListEditor
            title="Itinerary"
            hint="Langkah per hari perjalanan"
            items={itinerary[activeLocale]}
            onChange={(index, value) => updateList(setItinerary, activeLocale, index, value)}
            onAdd={() => addList(setItinerary, activeLocale)}
            onRemove={(index) => removeList(setItinerary, activeLocale, index)}
          />
          <StringListEditor
            title="Termasuk (Includes)"
            hint="Fasilitas yang termasuk"
            items={includes[activeLocale]}
            onChange={(index, value) => updateList(setIncludes, activeLocale, index, value)}
            onAdd={() => addList(setIncludes, activeLocale)}
            onRemove={(index) => removeList(setIncludes, activeLocale, index)}
          />
          <StringListEditor
            title="Tidak Termasuk (Excludes)"
            hint="Yang tidak termasuk"
            items={excludes[activeLocale]}
            onChange={(index, value) => updateList(setExcludes, activeLocale, index, value)}
            onAdd={() => addList(setExcludes, activeLocale)}
            onRemove={(index) => removeList(setExcludes, activeLocale, index)}
          />

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
                "Buat Paket"
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

function StringListEditor({
  title,
  hint,
  items,
  onChange,
  onAdd,
  onRemove,
}: {
  title: string;
  hint: string;
  items: StringList;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <Label>{title}</Label>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada item.</p>
        )}
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={item.value}
              onChange={(e) => onChange(index, e.target.value)}
              placeholder="Item..."
              className="rounded-full"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove(index)}
              aria-label={`Hapus item ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={onAdd}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah item
        </Button>
      </div>
    </div>
  );
}
