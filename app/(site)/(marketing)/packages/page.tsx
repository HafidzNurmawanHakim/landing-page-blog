import { listPackages, serializePackage } from "@/lib/db/repositories/packages";
import { PackagesView } from "./packages-view";

export const metadata = {
  title: "Paket Kami - Destitour",
  description:
    "Pilih paket Tour, Transport, atau Hotel sesuai kebutuhan liburanmu ke Batam.",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const selected =
    category && ["tour", "transport", "hotel"].includes(category)
      ? category
      : "all";

  const { items } = await listPackages({
    category: selected as "all" | "tour" | "transport" | "hotel",
  });
  const packages = items.map(serializePackage);

  return <PackagesView packages={packages} selected={selected} />;
}
