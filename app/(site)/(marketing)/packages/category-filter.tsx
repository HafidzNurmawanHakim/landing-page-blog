"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

const CATEGORIES = [
  { value: "all", labelKey: "common.all" },
  { value: "tour", labelKey: "common.tour" },
  { value: "transport", labelKey: "common.transport" },
  { value: "hotel", labelKey: "common.hotel" },
] as const;

export function CategoryFilter({ selected }: { selected: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  function selectCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const query = params.toString();
    router.push(query ? `/packages?${query}` : "/packages");
  }

  return (
    <div className="mb-10 flex flex-wrap justify-center gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => selectCategory(cat.value)}
          aria-pressed={selected === cat.value}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
            selected === cat.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {t(cat.labelKey)}
        </button>
      ))}
    </div>
  );
}
