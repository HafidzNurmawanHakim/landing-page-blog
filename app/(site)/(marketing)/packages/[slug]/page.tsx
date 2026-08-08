import { notFound } from "next/navigation";
import {
  getPackageBySlug,
  serializePackage,
} from "@/lib/db/repositories/packages";
import { PackageDetailView } from "./package-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Paket Tidak Ditemukan" };
  return {
    title: `${pkg.name} - Destitour`,
    description: pkg.description,
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await getPackageBySlug(slug);
  if (!raw) notFound();
  const pkg = serializePackage(raw);

  return <PackageDetailView pkg={pkg} />;
}
