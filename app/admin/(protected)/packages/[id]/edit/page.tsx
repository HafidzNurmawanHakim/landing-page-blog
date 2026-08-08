import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PackageForm } from "@/components/admin/package-form";
import {
  getPackageById,
  serializePackage,
} from "@/lib/db/repositories/packages";

export const metadata = {
  title: "Edit Paket - Admin Destitour",
};

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const packageId = Number(id);
  if (!Number.isInteger(packageId) || packageId <= 0) notFound();

  const pkg = await getPackageById(packageId);
  if (!pkg) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/packages"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar paket
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Edit Paket</h1>
        <p className="mt-2 text-muted-foreground">{pkg.code}</p>
      </header>

      <PackageForm pkg={serializePackage(pkg)} mode="edit" />
    </div>
  );
}
