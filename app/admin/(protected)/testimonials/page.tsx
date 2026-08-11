import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  listTestimonials,
  serializeTestimonial,
} from "@/lib/db/repositories/testimonials";
import { pickLocale } from "@/lib/i18n/locales";
import { formatDate } from "@/lib/utils/format";
import { TestimonialRowActions } from "@/components/admin/testimonial-row-actions";
import { ExportButton } from "@/components/ui/data-export";
import { PaginationNav } from "@/components/ui/pagination-nav";

export const metadata = {
  title: "Testimoni - Admin Destitour",
};

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 10;

  const result = await listTestimonials({ page, limit });

  // Clamp an out-of-range page (e.g. ?page=999) to the last available page.
  const safePage =
    result.totalPages > 0 ? Math.min(page, result.totalPages) : page;
  const safeResult =
    safePage !== page
      ? await listTestimonials({ page: safePage, limit })
      : result;

  const testimonials = safeResult.items.map(serializeTestimonial);

  function pageHref(next: number) {
    return `/admin/testimonials?page=${next}`;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Testimoni</h1>
          <p className="mt-2 text-muted-foreground">
            {safeResult.total} testimoni — yang aktif ditampilkan di halaman beranda
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButton
            resource="testimonials"
            filename="testimoni"
            label="Export"
          />
          <Button asChild size="lg" className="rounded-full">
            <Link href="/admin/testimonials/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Testimoni
            </Link>
          </Button>
        </div>
      </header>

      <Card className="rounded-3xl">
        <CardContent className="overflow-x-auto p-0">
          {testimonials.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              Belum ada testimoni. Tambahkan testimoni pertama untuk ditampilkan
              di beranda.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary text-left text-muted-foreground">
                  <th className="p-4 font-medium">Nama</th>
                  <th className="p-4 font-medium">Komentar</th>
                  <th className="p-4 font-medium">Rating</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Ditambahkan</th>
                  <th className="p-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {testimonials.map((item) => {
                  const comment = pickLocale(item.comment);
                  const role = pickLocale(item.role);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-secondary last:border-0 hover:bg-accent/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            {item.avatarUrl ? (
                              <AvatarImage src={item.avatarUrl} alt={item.name} />
                            ) : null}
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              {item.name
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium">{item.name}</p>
                            {role && (
                              <p className="text-xs text-muted-foreground">
                                {role}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-md p-4">
                        <p className="line-clamp-2 text-muted-foreground">
                          {comment || "-"}
                        </p>
                      </td>
                      <td className="p-4">
                        <RatingStars rating={item.rating} />
                      </td>
                      <td className="p-4">
                        <Badge
                          className={`border-0 rounded-full ${
                            item.isActive === 1
                              ? "bg-emerald-500 text-white"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {item.isActive === 1 ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <TestimonialRowActions item={item} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <PaginationNav
        page={safeResult.page}
        totalPages={safeResult.totalPages}
        buildHref={pageHref}
      />
    </div>
  );
}
