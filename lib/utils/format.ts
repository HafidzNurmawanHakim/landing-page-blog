export function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const CURRENCY_SYMBOL: Record<string, string> = {
  IDR: "Rp",
  SGD: "S$",
  USD: "US$",
};

/**
 * Format a transport price. Prices are stored as integer whole units per
 * currency (docs/15-transport-product.md §15.4), so no decimals are shown.
 */
export function formatCurrency(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  return `${symbol}${new Intl.NumberFormat("id-ID").format(value)}`;
}

const TRANSPORT_CATEGORY_LABELS: Record<string, string> = {
  MPV: "MPV",
  MINI_VAN: "Mini Van",
  MINI_BUS: "Mini Bus",
  SUV: "SUV",
  SEDAN: "Sedan",
  VAN: "Van",
  BUS: "Bus",
};

/**
 * Human-readable label for a transport category enum value.
 * Falls back to converting snake_case into Title Case for unknown values.
 */
export function transportCategoryLabel(value: string): string {
  if (TRANSPORT_CATEGORY_LABELS[value]) return TRANSPORT_CATEGORY_LABELS[value];
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(value: string | number | null | undefined): string {
  if (!value) return "-";
  const date =
    typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
