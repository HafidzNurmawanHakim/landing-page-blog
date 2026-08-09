import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  getBlogPostById,
  serializeBlogPost,
  getAllBlogCategories,
} from "@/lib/db/repositories/blog";
import { localizedFirst } from "@/lib/validations/blog";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata = {
  title: "Edit Artikel - Admin Destitour",
};

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getBlogPostById(Number(id)).catch(() => null);
  if (!post) notFound();

  const categories = await getAllBlogCategories();
  const serialized = serializeBlogPost(post);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke blog
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Artikel</h1>
        <p className="mt-2 text-muted-foreground">
          Ubah konten, status, atau SEO artikel &quot;{localizedFirst(serialized.title)}&quot;.
        </p>
      </header>

      <BlogForm categories={categories} item={serialized} mode="edit" />
    </div>
  );
}
