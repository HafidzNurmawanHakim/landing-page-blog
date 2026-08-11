"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertCircle,
  FolderPlus,
  ImageUp,
  Languages,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import ModalImageUploader from "@/components/ui/image-uploader";
import type { ImageUploadModalRef } from "@/components/ui/image-uploader/_types";
import ModalDrawer, {
  ReusableModalRef,
} from "@/components/ui/modal-drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  blogPostSchema,
  localizedFirst,
  type BlogPostFormValues,
} from "@/lib/validations/blog";
import {
  createBlogPostAction,
  updateBlogPostAction,
  createBlogCategoryAction,
} from "@/app/actions/blog";
import type { BlogCategory } from "@/lib/db/schema";
import {
  LOCALE_LABELS,
  LOCALES,
  type Locale,
  type LocalizedString,
} from "@/lib/i18n/locales";
import { BlogEditor } from "./blog-editor";
import { cn } from "@/lib/utils";
import { humanizeError } from "@/lib/utils/errors";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

type StatusValue = "draft" | "published" | "archived";

const STATUS_LABELS: Record<StatusValue, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

type BlogFormItem = {
  id: number;
  title: LocalizedString;
  slug: string;
  excerpt: LocalizedString | null;
  content: LocalizedString;
  contentType: string;
  featuredImageUrl: string | null;
  featuredImageAlt: LocalizedString | null;
  categoryId: number | null;
  tags: string[];
  status: string;
  seoTitle: LocalizedString | null;
  seoDescription: LocalizedString | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
  noindex: number;
};

export function BlogForm({
  categories,
  item,
  mode,
}: {
  categories: BlogCategory[];
  item?: BlogFormItem;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const coverUploaderRef = useRef<ImageUploadModalRef>(null);
  const categoryDrawerRef = useRef<ReusableModalRef>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("id");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [categoryList, setCategoryList] = useState(categories);
  const [catLocale, setCatLocale] = useState<Locale>("id");
  const [catName, setCatName] = useState<Partial<Record<Locale, string>>>({});
  const [catSlug, setCatSlug] = useState("");
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof blogPostSchema>, any, z.output<typeof blogPostSchema>>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: item?.title ?? {},
      slug: item?.slug ?? "",
      excerpt: item?.excerpt ?? {},
      content: item?.content ?? {},
      contentType: (item?.contentType as "html" | "markdown") ?? "html",
      featuredImageUrl: item?.featuredImageUrl ?? "",
      featuredImageAlt: item?.featuredImageAlt ?? {},
      categoryId: item?.categoryId ?? undefined,
      tags: item?.tags ?? [],
      status: (item?.status as StatusValue) ?? "draft",
      seoTitle: item?.seoTitle ?? {},
      seoDescription: item?.seoDescription ?? {},
      ogImageUrl: item?.ogImageUrl ?? "",
      canonicalUrl: item?.canonicalUrl ?? "",
      noindex: item ? item.noindex === 1 : false,
    },
  });

  const watchedTitle = watch("title");
  const watchedSlug = watch("slug");
  const contentType = watch("contentType") ?? "html";
  const featuredImageUrl = watch("featuredImageUrl");
  const categoryId = watch("categoryId");
  const noindex = watch("noindex");
  const tags = watch("tags") ?? [];
  const formContent = watch("content") ?? {};

  // Auto-generate slug from the default-locale title until edited manually.
  useEffect(() => {
    if (isEdit) return;
    const titleText = localizedFirst(watchedTitle);
    if (titleText && !watchedSlug) {
      setValue("slug", generateSlug(titleText), { shouldValidate: false });
    }
  }, [watchedTitle, watchedSlug, isEdit, setValue]);

  function handleSlugManual(e: React.ChangeEvent<HTMLInputElement>) {
    setValue("slug", e.target.value, { shouldValidate: true });
  }

  function addTag(raw: string) {
    const value = raw.trim().replace(/,+$/, "").trim();
    if (!value) return;
    const next = [...(tags as string[])];
    if (!next.some((t) => t.toLowerCase() === value.toLowerCase())) {
      next.push(value);
    }
    setValue("tags", next, { shouldValidate: true });
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setValue(
        "tags",
        (tags as string[]).slice(0, -1),
        { shouldValidate: true }
      );
    }
  }

  function removeTag(index: number) {
    setValue(
      "tags",
      (tags as string[]).filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  }

  async function handleCreateCategory() {
    const name = {
      id: catName.id?.trim() ?? "",
      ms: catName.ms,
      en: catName.en,
      zh: catName.zh,
    };
    if (!name.id || !catSlug.trim()) return;
    setIsSavingCat(true);
    try {
      const res = await createBlogCategoryAction({
        name,
        slug: catSlug.trim(),
        description: {},
      });
      if (!res.success) {
        setFormError(res.message);
        toast.error(res.message);
        return;
      }
      setCategoryList((prev) => [
        ...prev,
        { id: res.id, name, slug: catSlug.trim(), description: null, createdAt: null, updatedAt: null },
      ]);
      setValue("categoryId", res.id, { shouldValidate: true });
      categoryDrawerRef.current?.close();
      setCatName({});
      setCatSlug("");
      toast.success("Kategori berhasil dibuat.");
    } catch (err) {
      const message = humanizeError(err, "Gagal membuat kategori.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSavingCat(false);
    }
  }

  async function onSubmit(values: z.output<typeof blogPostSchema>) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      // When Markdown mode is picked, convert the editor's HTML to Markdown so
      // the stored contentType matches the stored content (all locales).
      const payload: z.output<typeof blogPostSchema> = { ...values };
      if (payload.contentType === "markdown") {
        try {
          const converted: typeof payload.content = { id: "" };
          for (const code of LOCALES) {
            const html = payload.content[code];
            if (html && html.trim()) {
              converted[code] = turndownService.turndown(html);
            }
          }
          payload.content = converted;
        } catch {
          // fall back to raw HTML if conversion fails
        }
      }
      const result = isEdit
        ? await updateBlogPostAction(item!.id, payload)
        : await createBlogPostAction(payload);
      if (!result.success) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(isEdit ? "Artikel berhasil diperbarui." : "Artikel berhasil dibuat.");
      router.push("/admin/blogs");
      router.refresh();
    } catch (err) {
      const message = humanizeError(err, "Gagal menyimpan artikel. Coba lagi.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryOptions = [...new Map(categoryList.map((c) => [c.id, c])).values()];

  const titleError = errors.title?.[activeLocale]?.message;
  const excerptError = errors.excerpt?.[activeLocale]?.message;
  const contentError = errors.content?.id?.message ?? errors.content?.message;
  const seoTitleError = errors.seoTitle?.[activeLocale]?.message;
  const seoDescriptionError = errors.seoDescription?.[activeLocale]?.message;
  const altError = errors.featuredImageAlt?.[activeLocale]?.message;

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
          <p className="mt-2 text-xs text-muted-foreground">
            Wajib diisi setidaknya bahasa Indonesia (ID) untuk judul & konten.
            Bahasa lain opsional — otomatis memakai ID sebagai fallback.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Left / main column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Judul ({LOCALE_LABELS[activeLocale]}){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Itinerary Batam 3D2N Terbaik untuk Keluarga"
                  aria-invalid={!!titleError}
                  className={cn("rounded-full", titleError && "border-destructive")}
                  {...register(`title.${activeLocale}`)}
                />
                {titleError && (
                  <p className="text-sm text-destructive">{titleError}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    id="slug"
                    placeholder="itinerary-batam-3d2n-keluarga"
                    aria-invalid={!!errors.slug}
                    className={cn("rounded-full", errors.slug && "border-destructive")}
                    value={watchedSlug ?? ""}
                    onChange={handleSlugManual}
                  />
                </div>
                {errors.slug ? (
                  <p className="text-sm text-destructive">{errors.slug.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Dibuat otomatis dari judul (ID). Bisa diedit manual.
                  </p>
                )}
              </div>

              {/* Featured image */}
              <div className="space-y-2">
                <div>
                  <Label>Gambar Utama (Cover)</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Rasio 16:9 / 2:1 paling pas untuk cover artikel.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {featuredImageUrl ? (
                    <div className="relative h-32 w-56 overflow-hidden rounded-2xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredImageUrl}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("featuredImageUrl", "", { shouldValidate: true })}
                        className="absolute right-2 top-2 rounded-full border border-border bg-background p-1 text-destructive shadow hover:bg-destructive/10"
                        aria-label="Hapus cover"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className="flex h-32 w-56 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/30"
                      onClick={() => coverUploaderRef.current?.open()}
                    >
                      <ImageUp className="h-5 w-5" />
                      <span className="text-xs">Upload Cover</span>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => coverUploaderRef.current?.open()}
                  >
                    <ImageUp className="mr-2 h-4 w-4" />
                    {featuredImageUrl ? "Ganti" : "Pilih / Upload"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImageAlt">
                    Alt Text Cover ({LOCALE_LABELS[activeLocale]}, opsional)
                  </Label>
                  <Input
                    id="featuredImageAlt"
                    placeholder="Deskripsi singkat gambar untuk SEO"
                    className={cn("rounded-full", altError && "border-destructive")}
                    {...register(`featuredImageAlt.${activeLocale}`)}
                  />
                  {altError && (
                    <p className="text-sm text-destructive">{altError}</p>
                  )}
                </div>

                <ModalImageUploader
                  ref={coverUploaderRef}
                  title="Upload Cover Artikel"
                  description="Pilih gambar utama artikel. Gambar dikompres otomatis dan bisa dipotong rasio 2:1."
                  config={{
                    maxFiles: 1,
                    maxFileSize: 5,
                    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
                    enableCrop: true,
                    cropAspectRatio: 2,
                    enableCompression: true,
                    compressionOptions: {
                      targetMaxSizeKB: 500,
                      maxWidth: 1600,
                      initialWebPQuality: 0.85,
                    },
                    enableMultiple: false,
                  }}
                  onUploadComplete={(images) => {
                    const first = images[0];
                    if (first) {
                      setValue("featuredImageUrl", first.url, { shouldValidate: true });
                    }
                  }}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">
                  Ringkasan / Excerpt ({LOCALE_LABELS[activeLocale]})
                </Label>
                <div className="relative">
                  <Textarea
                    id="excerpt"
                    rows={3}
                    placeholder="Ringkasan singkat artikel (ditampilkan di kartu & meta description)."
                    aria-invalid={!!excerptError}
                    className={cn("rounded-3xl", excerptError && "border-destructive")}
                    {...register(`excerpt.${activeLocale}`)}
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {(watch(`excerpt.${activeLocale}`) ?? "").length}/300
                  </span>
                </div>
                {excerptError && (
                  <p className="text-sm text-destructive">{excerptError}</p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>
                    Konten ({LOCALE_LABELS[activeLocale]}){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setValue("contentType", "html", { shouldValidate: true })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        contentType === "html"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      Editor Visual
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("contentType", "markdown", { shouldValidate: true })}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                        contentType === "markdown"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      Markdown
                    </button>
                  </div>
                </div>
                <input type="hidden" {...register(`content.${activeLocale}`)} />
                <input type="hidden" {...register("contentType")} />
                <BlogEditor
                  key={activeLocale}
                  initialContent={formContent[activeLocale] ?? ""}
                  initialContentType={(item?.contentType as "html" | "markdown") ?? "html"}
                  onContentChange={(html) =>
                    setValue(`content.${activeLocale}`, html, { shouldValidate: true })
                  }
                  placeholder={`Tulis konten artikel (${LOCALE_LABELS[activeLocale]}) di sini...`}
                />
                {contentError && (
                  <p className="text-sm text-destructive">{contentError}</p>
                )}
              </div>
            </div>

            {/* Right / sidebar column */}
            <div className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watch("status") ?? "draft"}
                  onValueChange={(v) =>
                    setValue("status", v as StatusValue, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as StatusValue[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Published langsung tampil di halaman blog publik.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Kategori</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      value={categoryId ? String(categoryId) : ""}
                      onValueChange={(v) =>
                        setValue("categoryId", v ? Number(v) : undefined, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="rounded-full">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.length === 0 && (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            Belum ada kategori. Buat dulu.
                          </div>
                        )}
                        {categoryOptions.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {localizedFirst(cat.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => categoryDrawerRef.current?.open()}
                    title="Buat kategori baru"
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tag</Label>
                <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-input bg-transparent px-3 py-1.5">
                  {(tags as string[]).map((tag, i) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={`Hapus tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => addTag(tagInput)}
                    placeholder={tags.length === 0 ? "Tambahkan tag, tekan Enter..." : ""}
                    className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pisahkan dengan koma atau Enter. Maksimal 10 tag.
                </p>
              </div>

              {/* SEO */}
              <div className="space-y-3 rounded-3xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  SEO ({LOCALE_LABELS[activeLocale]})
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title (maks 60)</Label>
                  <Input
                    id="seoTitle"
                    placeholder="Judul khusus untuk Google"
                    className={cn("rounded-full", seoTitleError && "border-destructive")}
                    {...register(`seoTitle.${activeLocale}`)}
                  />
                  {seoTitleError && (
                    <p className="text-sm text-destructive">{seoTitleError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Meta Description (maks 160)</Label>
                  <Textarea
                    id="seoDescription"
                    rows={2}
                    placeholder="Deskripsi untuk hasil pencarian"
                    className={cn("rounded-3xl", seoDescriptionError && "border-destructive")}
                    {...register(`seoDescription.${activeLocale}`)}
                  />
                  {seoDescriptionError && (
                    <p className="text-sm text-destructive">{seoDescriptionError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ogImageUrl">OG Image URL</Label>
                  <Input
                    id="ogImageUrl"
                    placeholder="https://..."
                    className="rounded-full"
                    {...register("ogImageUrl")}
                  />
                  {errors.ogImageUrl && (
                    <p className="text-sm text-destructive">{errors.ogImageUrl.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <Input
                    id="canonicalUrl"
                    placeholder="https://..."
                    className="rounded-full"
                    {...register("canonicalUrl")}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                    checked={noindex === true}
                    onChange={(e) => setValue("noindex", e.target.checked, { shouldValidate: true })}
                  />
                  <span className="text-sm font-medium">No index (jangan di-crawl)</span>
                </label>
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : isEdit ? (
                    "Simpan Perubahan"
                  ) : (
                    "Buat Artikel"
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
            </div>
          </div>
        </form>

        <ModalDrawer ref={categoryDrawerRef} title="Kategori Baru">
          {(onClose) => (
            <div className="space-y-4 px-4 pb-4">
              <div className="flex flex-wrap gap-1.5">
                {LOCALES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCatLocale(code)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      catLocale === code
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    )}
                  >
                    {LOCALE_LABELS[code]}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="catName">
                  Nama Kategori ({LOCALE_LABELS[catLocale]})
                </Label>
                <Input
                  id="catName"
                  value={catName[catLocale] ?? ""}
                  onChange={(e) => {
                    const next = { ...catName, [catLocale]: e.target.value };
                    setCatName(next);
                    if (!catSlug) {
                      setCatSlug(
                        generateSlug(localizedFirst(next)).replace(/[^\w\s-]/g, "")
                      );
                    }
                  }}
                  placeholder="Contoh: Tips Wisata"
                  className="rounded-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catSlug">Slug</Label>
                <Input
                  id="catSlug"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="tips-wisata"
                  className="rounded-full"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full"
                  onClick={onClose}
                  disabled={isSavingCat}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  className="rounded-full"
                  disabled={isSavingCat || !(catName.id?.trim() ?? "") || !catSlug.trim()}
                  onClick={handleCreateCategory}
                >
                  {isSavingCat ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Buat Kategori"
                  )}
                </Button>
              </div>
            </div>
          )}
        </ModalDrawer>
      </CardContent>
    </Card>
  );
}
