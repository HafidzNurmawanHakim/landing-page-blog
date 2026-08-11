import { notFound } from "next/navigation";
import {
  getTransportProductBySlug,
  localizeTransportProduct,
} from "@/lib/db/repositories/transport";
import { pickLocale } from "@/lib/i18n/locales";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";
import { TransportDetailView } from "./transport-detail-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, locale] = await Promise.all([
    getTransportProductBySlug(slug),
    getServerLocale(),
  ]);
  if (!product) return { title: "Produk Tidak Ditemukan" };
  const title = `${pickLocale(product.title, locale)} - Destitour`;
  return buildPageMetadata({
    title,
    description: pickLocale(product.description, locale),
    path: `/transport/${product.slug}`,
    images: product.featuredImage
      ? [{ url: product.featuredImage }]
      : product.images[0]
        ? [{ url: product.images[0] }]
        : undefined,
  });
}

export default async function TransportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getServerLocale();
  const product = await getTransportProductBySlug(slug);
  if (!product) notFound();

  return (
    <TransportDetailView product={localizeTransportProduct(product, locale)} />
  );
}
