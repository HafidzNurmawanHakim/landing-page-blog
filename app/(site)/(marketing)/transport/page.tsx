import {
  listTransportProducts,
  localizeTransportProduct,
  TRANSPORT_CATEGORIES,
  type TransportCategory,
} from "@/lib/db/repositories/transport";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo } from "@/lib/config/site";
import { TransportView } from "./transport-view";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const seo = getSeo("transport", locale);
  return { title: seo.title, description: seo.description };
}

export default async function TransportPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const locale = await getServerLocale();

  const selected: TransportCategory | "all" =
    category && TRANSPORT_CATEGORIES.includes(category as TransportCategory)
      ? (category as TransportCategory)
      : "all";

  const { items } = await listTransportProducts({ category: selected });
  const products = items.map((p) => localizeTransportProduct(p, locale));
  const available = new Set(products.map((p) => p.category));
  const categories = TRANSPORT_CATEGORIES.filter((c) => available.has(c));

  return (
    <TransportView
      products={products}
      categories={categories}
      selected={selected}
    />
  );
}
