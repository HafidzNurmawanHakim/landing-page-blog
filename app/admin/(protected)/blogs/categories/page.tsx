import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { listBlogCategories } from "@/lib/db/repositories/blog";
import { BlogCategoriesManager } from "@/components/admin/blog-categories-manager";

export const metadata = {
  title: "Kategori Blog - Admin Destitour",
};

export default async function BlogCategoriesPage() {
  const { items } = await listBlogCategories({ limit: 100 });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke blog
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Kategori Blog</h1>
        <p className="mt-2 text-muted-foreground">
          {items.length} kategori — kelompokkan artikel supaya mudah ditemukan.
        </p>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="p-6">
          <BlogCategoriesManager categories={items} />
        </CardContent>
      </Card>
    </div>
  );
}
