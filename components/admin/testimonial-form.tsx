"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ImageUp, Languages, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ModalImageUploader from "@/components/ui/image-uploader";
import type { ImageUploadModalRef } from "@/components/ui/image-uploader/_types";
import {
  testimonialSchema,
  type TestimonialFormValues,
} from "@/lib/validations/testimonials";
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/app/actions/testimonials";
import type { SerializedTestimonial } from "@/lib/db/repositories/testimonials";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { humanizeError } from "@/lib/utils/errors";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TestimonialForm({
  item,
  mode,
}: {
  item?: SerializedTestimonial;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const uploaderRef = useRef<ImageUploadModalRef>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof testimonialSchema>, any, z.output<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: item?.name ?? "",
      role: item?.role ?? {},
      comment: item?.comment ?? {},
      rating: item?.rating ?? 5,
      avatarUrl: item?.avatarUrl ?? "",
      isActive: item ? item.isActive === 1 : true,
      sortOrder: item?.sortOrder ?? 0,
    },
  });

  const avatarUrl = watch("avatarUrl");
  const name = watch("name");

  async function onSubmit(values: z.output<typeof testimonialSchema>) {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = isEdit
        ? await updateTestimonialAction(item!.id, values)
        : await createTestimonialAction(values);

      if (!result.success) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(isEdit ? "Testimoni berhasil diperbarui." : "Testimoni berhasil ditambahkan.");
      router.push("/admin/testimonials");
      router.refresh();
    } catch (err) {
      const message = humanizeError(err, "Gagal menyimpan testimoni. Coba lagi.");
      setFormError(message);
      toast.error(message);
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Budi Santoso"
              aria-invalid={!!errors.name}
              className={cn("rounded-full", errors.name && "border-destructive")}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Avatar */}
          <div className="space-y-2">
            <div>
              <Label>Foto Avatar (opsional)</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Jika kosong, inisial nama yang ditampilkan. Rasio persegi (1:1)
                paling pas untuk avatar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {initialsOf(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => uploaderRef.current?.open()}
                >
                  <ImageUp className="mr-2 h-4 w-4" />
                  Pilih / Upload Avatar
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() =>
                      setValue("avatarUrl", "", { shouldValidate: true })
                    }
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>

            <ModalImageUploader
              ref={uploaderRef}
              title="Upload Avatar"
              description="Pilih foto untuk avatar testimoni. Gambar dikompres otomatis dan bisa dipotong persegi."
              config={{
                maxFiles: 1,
                maxFileSize: 5,
                acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
                enableCrop: true,
                cropAspectRatio: 1,
                enableCompression: true,
                compressionOptions: {
                  targetMaxSizeKB: 500,
                  maxWidth: 800,
                  initialWebPQuality: 0.9,
                },
                enableMultiple: false,
              }}
              onUploadComplete={(images) => {
                const first = images[0];
                if (first) {
                  setValue("avatarUrl", first.url, { shouldValidate: true });
                }
              }}
            />
          </div>

          {/* Rating & Sort Order & Aktif */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                placeholder="5"
                aria-invalid={!!errors.rating}
                className={cn("rounded-full", errors.rating && "border-destructive")}
                {...register("rating", { setValueAs: (v) => (v === "" ? 0 : Number(v)) })}
              />
              {errors.rating && (
                <p className="text-sm text-destructive">{errors.rating.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan</Label>
              <Input
                id="sortOrder"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                aria-invalid={!!errors.sortOrder}
                className={cn("rounded-full", errors.sortOrder && "border-destructive")}
                {...register("sortOrder", { setValueAs: (v) => (v === "" ? 0 : Number(v)) })}
              />
              {errors.sortOrder && (
                <p className="text-sm text-destructive">
                  {errors.sortOrder.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Angka kecil tampil lebih dulu.
              </p>
            </div>
          </div>

          {/* Aktif */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
              {...register("isActive")}
            />
            <span className="text-sm font-medium">
              Tampilkan di halaman beranda
            </span>
          </label>

          {/* Locale tabs */}
          <div>
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

          {/* Role per bahasa */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Peran / Paket <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Contoh: &quot;Tour Batam 3D2N&quot; — ditampilkan di bawah nama.
            </p>
            <Input
              id="role"
              placeholder="Tour Batam 3D2N"
              className="rounded-full"
              {...register(`role.${activeLocale}`)}
            />
          </div>

          {/* Komentar per bahasa */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Komentar <span className="text-destructive">*</span>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Wajib diisi setidaknya bahasa Indonesia (ID). Bahasa lain opsional.
            </p>
            <Textarea
              id="comment"
              rows={4}
              placeholder="Tulis testimoni..."
              aria-invalid={!!errors.comment}
              className={cn("rounded-3xl", errors.comment && "border-destructive")}
              {...register(`comment.${activeLocale}`)}
            />
            {errors.comment && (
              <p className="text-sm text-destructive">{errors.comment.message}</p>
            )}
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
                "Tambah Testimoni"
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
