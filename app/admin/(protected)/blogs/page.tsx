import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listBlogPosts,
  serializeBlogPost,
  getAllBlogCategories,
  BLOG_POST_STATUSES,
  type BlogPostStatus,
} from "@/lib/db/repositories/blog";
import { localizedFirst } from "@/lib/validations/blog";
import { formatDate } from "@/lib/utils/format";
import { BlogRowActions } from "@/components/admin/blog-row-actions";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Blog - Admin Destitour",
};

const STATUS_FILTERS: Array<BlogPostStatus | "all"> = ["all", ...BLOG_POST_STATUSES];

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

function normalizeStatus(value: string | undefined): BlogPostStatus | "all" {
  return (BLOG_POST_STATUSES as readonly string[]).includes(value ?? "")
    ? (value as BlogPostStatus)
    : "all";
}

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = normalizeStatus(sp.status);
  const search = sp.search?.trim() || undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 10;

  const result = await listBlogPosts({
    status: status as BlogPostStatus | "all",
    keyword: search,
    page,
    limit,
  });
  const posts = result.items.map(serializeBlogPost);
  const categories = await getAllBlogCategories();
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));

  const safePage = result.totalPages > 0 ? Math.min(page, result.totalPages) : page;
  const safeResult =
    safePage !== page
      ? await listBlogPosts({
          status: status as BlogPostStatus | "all",
          keyword: search,
          page: safePage,
          limit,
        })
      : result;
  const safePosts = safeResult.items.map(serializeBlogPost);

  function filterHref(value: BlogPostStatus | "all") {
    const params = new URLSearchParams();
    if (value !== "all") params.set("status", value);
    if (search) params.set("search", search);
    const qs = params.toString();
    return qs ? `/admin/blogs?${qs}` : "/admin/blogs";
  }

  function pageHref(next: number) {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search) params.set("search", search);
    params.set("page", String(next));
    return `/admin/blogs?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            {safeResult.total} artikel — kelola konten blog publik
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form action="/admin/blogs" method="GET" className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              defaultValue={search ?? ""}
              placeholder="Cari judul..."
              className="rounded-full pl-10"
              aria-label="Cari artikel"
            />
          </form>
          <Button asChild size="lg" className="rounded-full">
            <Link href="/admin/blogs/new">
              <Plus className="mr-2 h-4 w-4" />
              Artikel Baru
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((value) => (
          <Link
            key={value}
            href={filterHref(value)}
            aria-current={status === value ? "page" : undefined}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
              status === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            {value === "all" ? "Semua" : STATUS_LABELS[value]}
          </Link>
        ))}
        <Link
          href="/admin/blogs/categories"
          className="ml-auto rounded-full px-5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Kelola Kategori
        </Link>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {safePosts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada artikel yang cocok. Buat artikel pertama untuk ditampilkan
              di halaman blog.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Judul</th>
                  <th className="p-4 font-medium">Kategori</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Dipublikasi</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {safePosts.map((post) => (
                  <tr
                    key={post.id}
                    className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                  >
                    <td className="max-w-md p-4">
                      <p className="line-clamp-1 font-medium">{localizedFirst(post.title)}</p>
                      {post.excerpt && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {localizedFirst(post.excerpt)}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {post.categoryId ? (localizedFirst(categoryName.get(post.categoryId)) || "-") : "-"}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`border-0 rounded-full ${
                          post.status === "published"
                            ? "bg-emerald-500 text-white"
                            : post.status === "archived"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-amber-400 text-amber-950"
                        }`}
                      >
                        {STATUS_LABELS[post.status as BlogPostStatus]}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <BlogRowActions item={post} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {safeResult.totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-2"
          aria-label="Pagination"
        >
          <Button
            asChild={safePage > 1}
            variant="ghost"
            size="icon"
            disabled={safePage <= 1}
            className="rounded-full"
          >
            {safePage > 1 ? (
              <Link href={pageHref(safePage - 1)} aria-label="Halaman sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                <ChevronLeft className="h-4 w-4" />
              </span>
            )}
          </Button>
          <span className="px-3 text-sm text-muted-foreground">
            Halaman {safeResult.page} / {safeResult.totalPages}
          </span>
          <Button
            asChild={safePage < safeResult.totalPages}
            variant="ghost"
            size="icon"
            disabled={safePage >= safeResult.totalPages}
            className="rounded-full"
          >
            {safePage < safeResult.totalPages ? (
              <Link href={pageHref(safePage + 1)} aria-label="Halaman berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <span>
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </nav>
      )}
    </div>
  );
}
