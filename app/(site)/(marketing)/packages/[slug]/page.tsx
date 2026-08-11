import { notFound } from "next/navigation";
import {
  getPackageBySlug,
  serializePackage,
} from "@/lib/db/repositories/packages";
import { pickLocale } from "@/lib/i18n/locales";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { PackageDetailView } from "./package-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pkg, locale] = await Promise.all([getPackageBySlug(slug), getServerLocale()]);
  if (!pkg) return { title: "Paket Tidak Ditemukan" };
  const title = `${pickLocale(pkg.name, locale)} - Destitour`;
  return buildPageMetadata({
    title,
    description: pickLocale(pkg.description, locale),
    path: `/packages/${pkg.slug}`,
    images: pkg.imageUrl
      ? [{ url: pkg.imageUrl }]
      : undefined,
  });
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
