import { notFound } from "next/navigation";
import {
  getTransportProductBySlug,
  localizeTransportProduct,
} from "@/lib/db/repositories/transport";
import { pickLocale } from "@/lib/i18n/locales";
import { getServerLocale } from "@/lib/i18n/server";
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
  return {
    title: `${pickLocale(product.title, locale)} - Destitour`,
    description: pickLocale(product.description, locale),
  };
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
