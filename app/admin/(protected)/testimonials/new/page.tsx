import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const metadata = {
  title: "Tambah Testimoni - Admin Destitour",
};

export default function NewTestimonialPage() {
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
          Tambah Testimoni
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tambah testimoni untuk ditampilkan di halaman beranda.
        </p>
      </header>

      <TestimonialForm mode="create" />
    </div>
  );
}
