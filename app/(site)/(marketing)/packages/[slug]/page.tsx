import { notFound } from "next/navigation";
import {
  getPackageBySlug,
  serializePackage,
} from "@/lib/db/repositories/packages";
import { pickLocale } from "@/lib/i18n/locales";
import { getServerLocale } from "@/lib/i18n/server";
import { PackageDetailView } from "./package-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pkg, locale] = await Promise.all([getPackageBySlug(slug), getServerLocale()]);
  if (!pkg) return { title: "Paket Tidak Ditemukan" };
  return {
    title: `${pickLocale(pkg.name, locale)} - Destitour`,
    description: pickLocale(pkg.description, locale),
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
