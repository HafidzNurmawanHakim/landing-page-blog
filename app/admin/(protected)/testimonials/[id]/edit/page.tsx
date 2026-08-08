import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/testimonial-form";
import {
  getTestimonialById,
  serializeTestimonial,
} from "@/lib/db/repositories/testimonials";

export const metadata = {
  title: "Edit Testimoni - Admin Destitour",
};

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) notFound();

  const item = await getTestimonialById(itemId);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        href="/admin/testimonials"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke testimoni
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Edit Testimoni
        </h1>
        <p className="mt-2 text-muted-foreground">Testimoni #{item.id}</p>
      </header>

      <TestimonialForm item={serializeTestimonial(item)} mode="edit" />
    </div>
  );
}
