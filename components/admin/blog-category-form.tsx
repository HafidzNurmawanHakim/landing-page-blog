"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Languages, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  blogCategorySchema,
  localizedFirst,
  type BlogCategoryFormValues,
} from "@/lib/validations/blog";
import {
  createBlogCategoryAction,
  updateBlogCategoryAction,
} from "@/app/actions/blog";
import type { BlogCategory } from "@/lib/db/schema";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { humanizeError } from "@/lib/utils/errors";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function BlogCategoryForm({
  category,
  onClose,
}: {
  category?: BlogCategory;
  onClose?: () => void;
}) {
  const router = useRouter();
  const isEdit = Boolean(category?.id);
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof blogCategorySchema>, any, z.output<typeof blogCategorySchema>>({
    resolver: zodResolver(blogCategorySchema),
    defaultValues: {
      name: category?.name ?? {},
      slug: category?.slug ?? "",
      description: category?.description ?? {},
    },
  });

  // Auto-fill slug from the default-locale name while slug is still empty.
  const watchedName = watch("name");
  const watchedSlug = watch("slug");
  useEffect(() => {
    if (!isEdit && watchedName && !watchedSlug) {
      setValue("slug", generateSlug(localizedFirst(watchedName)), {
        shouldValidate: false,
      });
    }
  }, [watchedName, watchedSlug, isEdit, setValue]);

  async function onSubmit(values: z.output<typeof blogCategorySchema>) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const result = isEdit
        ? await updateBlogCategoryAction(category!.id, values)
        : await createBlogCategoryAction(values);
      if (!result.success) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(isEdit ? "Kategori berhasil diperbarui." : "Kategori berhasil dibuat.");
      router.refresh();
      onClose?.();
    } catch (err) {
      const message = humanizeError(err, "Gagal menyimpan kategori. Coba lagi.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const nameError = errors.name?.[activeLocale]?.message;
  const descError = errors.description?.[activeLocale]?.message;

  return (
    <div>
      {formError && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Bahasa — mengedit: {LOCALE_LABELS[activeLocale]}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setActiveLocale(code)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
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
          <Label htmlFor="cat-name">
            Nama Kategori ({LOCALE_LABELS[activeLocale]}){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            placeholder="Contoh: Tips Wisata"
            aria-invalid={!!nameError}
            className={cn("rounded-full", nameError && "border-destructive")}
            {...register(`name.${activeLocale}`)}
          />
          {nameError && (
            <p className="text-sm text-destructive">{nameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-slug">
            Slug <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-slug"
            placeholder="tips-wisata"
            aria-invalid={!!errors.slug}
            className={cn("rounded-full", errors.slug && "border-destructive")}
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-sm text-destructive">{errors.slug.message}</p>
          )}
          {!isEdit && (
            <p className="text-xs text-muted-foreground">
              Otomatis dibuat dari nama saat slug kosong.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-desc">
            Deskripsi ({LOCALE_LABELS[activeLocale]}, opsional)
          </Label>
          <Input
            id="cat-desc"
            placeholder="Deskripsi singkat kategori"
            className={cn("rounded-full", descError && "border-destructive")}
            {...register(`description.${activeLocale}`)}
          />
          {descError && (
            <p className="text-sm text-destructive">{descError}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              className="rounded-full"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
          <Button type="submit" className="rounded-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : isEdit ? (
              "Simpan Perubahan"
            ) : (
              "Buat Kategori"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export { generateSlug };
