import { listPackages, serializePackage } from "@/lib/db/repositories/packages";
import { getServerLocale } from "@/lib/i18n/server";
import { getSeo } from "@/lib/config/site";
import { buildPageMetadata } from "@/lib/seo";
import { PackagesView } from "./packages-view";

export async function generateMetadata() {
  const locale = await getServerLocale();
  const seo = getSeo("packages", locale);
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: "/packages",
  });
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected = category === "tour" ? "tour" : "all";

  const { items } = await listPackages({
    category: selected as "all" | "tour",
  });
  const packages = items.map(serializePackage);

  return <PackagesView packages={packages} selected={selected} />;
}
