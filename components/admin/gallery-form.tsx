"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ImageUp, Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PackageImage } from "@/components/package/package-image";
import ModalImageUploader from "@/components/ui/image-uploader";
import type { ImageUploadModalRef } from "@/components/ui/image-uploader/_types";
import {
  galleryItemSchema,
  type GalleryItemFormValues,
} from "@/lib/validations/gallery";
import {
  createGalleryItemAction,
  updateGalleryItemAction,
} from "@/app/actions/gallery";
import type { SerializedGalleryItem } from "@/lib/db/repositories/gallery";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

export function GalleryForm({
  item,
  mode,
}: {
  item?: SerializedGalleryItem;
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
  } = useForm<z.input<typeof galleryItemSchema>, any, z.output<typeof galleryItemSchema>>({
    resolver: zodResolver(galleryItemSchema),
    defaultValues: {
      imageUrl: item?.imageUrl ?? "",
      caption: item?.caption ?? {},
    },
  });

  async function onSubmit(values: z.output<typeof galleryItemSchema>) {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = isEdit
        ? await updateGalleryItemAction(item!.id, values)
        : await createGalleryItemAction(values);

      if (!result.success) {
        setFormError(result.message);
        return;
      }
      router.push("/admin/gallery");
      router.refresh();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Gagal menyimpan gambar. Coba lagi."
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

        {/* Locale tabs for captions */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Languages className="h-4 w-4 text-muted-foreground" />
            Bahasa caption
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
          <div className="space-y-2">
            <div>
              <Label>Gambar</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Rasio persegi (1:1) paling pas untuk tampilan grid. Gambar
                dikompres otomatis ke WebP (maks ±500 KB) dan bisa dipotong
                sebelum upload.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <PackageImage
                src={watch("imageUrl")}
                alt=""
                className="h-28 w-28 rounded-2xl"
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
                    onClick={() => setValue("imageUrl", "", { shouldValidate: true })}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL Gambar</Label>
            <Input
              id="imageUrl"
              placeholder="https://media.example.com/gallery/abc.jpg"
              aria-invalid={!!errors.imageUrl}
              className={cn("rounded-full", errors.imageUrl && "border-destructive")}
              {...register("imageUrl")}
            />
            {errors.imageUrl && (
              <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Wajib diisi setidaknya bahasa Indonesia (ID). Bahasa lain opsional.
            </p>
            <Textarea
              id="caption"
              rows={3}
              placeholder="Caption foto..."
              aria-invalid={!!errors.caption}
              className={cn("rounded-3xl", errors.caption && "border-destructive")}
              {...register(`caption.${activeLocale}`)}
            />
            {errors.caption && (
              <p className="text-sm text-destructive">{errors.caption.message}</p>
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
                "Tambah ke Galeri"
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
