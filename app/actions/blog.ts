"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import {
  blogPostSchema,
  blogCategorySchema,
} from "@/lib/validations/blog";
import {
  createBlogPost,
  createBlogCategory,
  deleteBlogCategory,
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
  updateBlogCategory,
  getBlogCategoryById,
  getBlogPostCountByCategory,
} from "@/lib/db/repositories/blog";
import { estimateReadingTime } from "@/lib/services/blog-content";

export type BlogActionResult =
  | { success: true; id: number }
  | { success: false; message: string };

const idSchema = z.coerce.number().int().positive();

function toDbPostInput(data: z.output<typeof blogPostSchema>) {
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    content: data.content,
    contentType: data.contentType,
    featuredImageUrl: data.featuredImageUrl || null,
    featuredImageAlt: data.featuredImageAlt || null,
    categoryId: data.categoryId ?? null,
    tags: (data.tags ?? []).filter((t) => t.trim()),
    status: data.status,
    publishedAt: data.status === "published" ? Math.floor(Date.now() / 1000) : null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    ogImageUrl: data.ogImageUrl || null,
    canonicalUrl: data.canonicalUrl || null,
    noindex: data.noindex === true ? 1 : 0,
    authorId: null,
    readingTime: estimateReadingTime(data.content.id, data.contentType),
  };
}

function slugError(err: unknown): string {
  if (err instanceof Error && /unique/i.test(err.message)) {
    return "Slug sudah dipakai artikel lain. Gunakan slug berbeda.";
  }
  return "Gagal menyimpan artikel. Coba lagi.";
}

export async function createBlogPostAction(
  input: z.input<typeof blogPostSchema>
): Promise<BlogActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const item = await createBlogPost(toDbPostInput(parsed.data));
    return { success: true, id: item.id };
  } catch (err) {
    console.error("createBlogPostAction failed:", err);
    return { success: false, message: slugError(err) };
  }
}

export async function updateBlogPostAction(
  id: number,
  input: z.input<typeof blogPostSchema>
): Promise<BlogActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID artikel tidak valid." };
  }

  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const existing = await getBlogPostById(id);
    if (!existing) {
      return { success: false, message: "Artikel tidak ditemukan." };
    }

    const updated = await updateBlogPost(id, toDbPostInput(parsed.data));
    if (!updated) {
      return { success: false, message: "Artikel tidak ditemukan." };
    }
    return { success: true, id: updated.id };
  } catch (err) {
    console.error("updateBlogPostAction failed:", err);
    return { success: false, message: slugError(err) };
  }
}

export async function deleteBlogPostAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID artikel tidak valid." };
  }

  try {
    const deleted = await deleteBlogPost(id);
    if (!deleted) {
      return { success: false, message: "Artikel tidak ditemukan." };
    }
    return { success: true };
  } catch (err) {
    console.error("deleteBlogPostAction failed:", err);
    return { success: false, message: "Gagal menghapus artikel. Coba lagi." };
  }
}

// --- Categories ---

function toDbCategoryInput(data: z.output<typeof blogCategorySchema>) {
  return {
    name: data.name,
    slug: data.slug,
    description: data.description || null,
  };
}

function categorySlugError(err: unknown): string {
  if (err instanceof Error && /unique/i.test(err.message)) {
    return "Slug kategori sudah dipakai. Gunakan slug berbeda.";
  }
  return "Gagal menyimpan kategori. Coba lagi.";
}

export async function createBlogCategoryAction(
  input: z.input<typeof blogCategorySchema>
): Promise<BlogActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const item = await createBlogCategory(toDbCategoryInput(parsed.data));
    return { success: true, id: item.id };
  } catch (err) {
    console.error("createBlogCategoryAction failed:", err);
    return { success: false, message: categorySlugError(err) };
  }
}

export async function updateBlogCategoryAction(
  id: number,
  input: z.input<typeof blogCategorySchema>
): Promise<BlogActionResult> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID kategori tidak valid." };
  }

  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Input tidak valid.",
    };
  }

  try {
    const existing = await getBlogCategoryById(id);
    if (!existing) {
      return { success: false, message: "Kategori tidak ditemukan." };
    }

    const updated = await updateBlogCategory(id, toDbCategoryInput(parsed.data));
    if (!updated) {
      return { success: false, message: "Kategori tidak ditemukan." };
    }
    return { success: true, id: updated.id };
  } catch (err) {
    console.error("updateBlogCategoryAction failed:", err);
    return { success: false, message: categorySlugError(err) };
  }
}

export async function deleteBlogCategoryAction(id: number): Promise<{
  success: boolean;
  message?: string;
}> {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  if (!idSchema.safeParse(id).success) {
    return { success: false, message: "ID kategori tidak valid." };
  }

  try {
    const postCount = await getBlogPostCountByCategory(id);
    if (postCount > 0) {
      return {
        success: false,
        message: `Kategori masih dipakai ${postCount} artikel. Pindahkan dulu ke kategori lain.`,
      };
    }
    const deleted = await deleteBlogCategory(id);
    if (!deleted) {
      return { success: false, message: "Kategori tidak ditemukan." };
    }
    return { success: true };
  } catch (err) {
    console.error("deleteBlogCategoryAction failed:", err);
    return { success: false, message: "Gagal menghapus kategori. Coba lagi." };
  }
}
