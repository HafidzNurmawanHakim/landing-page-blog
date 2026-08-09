import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllBlogCategories } from "@/lib/db/repositories/blog";
import { BlogForm } from "@/components/admin/blog-form";

export const metadata = {
  title: "Artikel Baru - Admin Destitour",
};

export default async function NewBlogPage() {
  const categories = await getAllBlogCategories();

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
        <h1 className="text-3xl font-semibold tracking-tight">Artikel Baru</h1>
        <p className="mt-2 text-muted-foreground">
          Tulis artikel blog dengan editor visual. Simpan sebagai draft atau
          langsung publish.
        </p>
      </header>

      <BlogForm categories={categories} mode="create" />
    </div>
  );
}
