"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  ImageUp,
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

export function PackageForm({
  pkg,
  mode,
}: {
  pkg?: SerializedPackage;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<StringList>(() =>
    toList(pkg?.itinerary)
  );
  const [includes, setIncludes] = useState<StringList>(() =>
    toList(pkg?.includes)
  );
  const [excludes, setExcludes] = useState<StringList>(() =>
    toList(pkg?.excludes)
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
      name: pkg?.name ?? "",
      slug: pkg?.slug ?? "",
      category: (pkg?.category as PackageFormValues["category"]) ?? "tour",
      duration: pkg?.duration ?? "",
      price: pkg?.price ?? 0,
      description: pkg?.description ?? "",
      imageUrl: pkg?.imageUrl ?? "",
      imageAlt: pkg?.imageAlt ?? "",
      isActive: pkg?.isActive ?? 1,
    },
  });

  const slugValue = watch("slug") ?? "";
  const nameValue = watch("name") ?? "";

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
    setter: React.Dispatch<React.SetStateAction<StringList>>,
    index: number,
    value: string
  ) {
    setter((prev) => prev.map((item, i) => (i === index ? { value } : item)));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { data?: { url?: string }; error?: string };
      if (!res.ok || !json.data?.url) {
        throw new Error(json.error ?? "Gagal upload gambar.");
      }
      setValue("imageUrl", json.data.url, { shouldValidate: true });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal upload gambar."
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function onSubmit(values: z.output<typeof packageFormSchema>) {
    setIsSubmitting(true);
    setFormError(null);

    const payload: PackageFormValues = {
      ...values,
      itinerary: fromList(itinerary),
      includes: fromList(includes),
      excludes: fromList(excludes),
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

          <Field id="name" label="Nama Paket" error={errors.name?.message}>
            <Input
              id="name"
              placeholder="Batam 3 Hari 2 Malam"
              aria-invalid={!!errors.name}
              className={cn("rounded-full", errors.name && "border-destructive")}
              {...register("name", { onBlur: autoSlug })}
            />
          </Field>

          <Field
            id="slug"
            label="Slug URL"
            hint="Kosongkan untuk membuat otomatis dari nama"
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
              {...register("description")}
            />
          </Field>

          <div className="space-y-2">
            <div>
              <Label>Gambar Paket</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload dari perangkat atau tempel URL gambar (max 5 MB, JPG/PNG/WebP/AVIF/GIF).
              </p>
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <PackageImage
                src={watch("imageUrl")}
                alt={watch("imageAlt")}
                className="h-28 w-40 rounded-2xl"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-accent">
                  <ImageUp className="h-4 w-4" />
                  {isUploading ? "Mengupload..." : "Upload Gambar"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className="sr-only"
                    disabled={isUploading}
                    onChange={(e) => void handleUpload(e)}
                  />
                </label>
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
              </div>
            </div>
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
            <Field id="imageAlt" label="Teks Alt" error={errors.imageAlt?.message}>
              <Input
                id="imageAlt"
                placeholder="Deskripsi singkat gambar"
                className={cn("rounded-full", errors.imageAlt && "border-destructive")}
                {...register("imageAlt")}
              />
            </Field>
          </div>

          <StringListEditor
            title="Itinerary"
            hint="Langkah per hari perjalanan"
            items={itinerary}
            onChange={(index, value) => updateList(setItinerary, index, value)}
            onAdd={() => setItinerary((prev) => [...prev, { value: "" }])}
            onRemove={(index) =>
              setItinerary((prev) => prev.filter((_, i) => i !== index))
            }
          />
          <StringListEditor
            title="Termasuk (Includes)"
            hint="Fasilitas yang termasuk"
            items={includes}
            onChange={(index, value) => updateList(setIncludes, index, value)}
            onAdd={() => setIncludes((prev) => [...prev, { value: "" }])}
            onRemove={(index) =>
              setIncludes((prev) => prev.filter((_, i) => i !== index))
            }
          />
          <StringListEditor
            title="Tidak Termasuk (Excludes)"
            hint="Yang tidak termasuk"
            items={excludes}
            onChange={(index, value) => updateList(setExcludes, index, value)}
            onAdd={() => setExcludes((prev) => [...prev, { value: "" }])}
            onRemove={(index) =>
              setExcludes((prev) => prev.filter((_, i) => i !== index))
            }
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
