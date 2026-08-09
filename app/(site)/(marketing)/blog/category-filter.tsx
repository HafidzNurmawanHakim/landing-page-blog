"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export function BlogCategoryFilter({
  categories,
  selected,
}: {
  categories: { slug: string; name: string }[];
  selected: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  function selectCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    const query = params.toString();
    router.push(query ? `/blog?${query}` : "/blog");
  }

  const chips: { slug: string | null; name: string }[] = [
    { slug: null, name: t("common.all") },
    ...categories,
  ];

  return (
    <div className="mb-10 flex flex-wrap justify-center gap-2">
      {chips.map((chip) => {
        const active = selected === chip.slug;
        return (
          <button
            key={chip.slug ?? "all"}
            type="button"
            onClick={() => selectCategory(chip.slug)}
            aria-pressed={active}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            )}
          >
            {chip.name}
          </button>
        );
      })}
    </div>
  );
}
