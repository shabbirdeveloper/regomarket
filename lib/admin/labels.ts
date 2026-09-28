import { categories } from "@/data/categories";
import { districts } from "@/data/locations";

/** Small lookups shared by admin modules (client-safe). */
export const CATEGORY_NAME: Record<string, string> = Object.fromEntries(categories.map((c) => [c.slug, c.shortName]));
export const DISTRICT_NAME: Record<string, string> = Object.fromEntries(districts.map((d) => [d.slug, d.name]));

export const CATEGORY_OPTIONS = categories.map((c) => ({ value: c.slug, label: c.shortName }));
export const DISTRICT_OPTIONS = districts.map((d) => ({ value: d.slug, label: d.name }));

export const place = (district: string, town?: string) => {
  const d = DISTRICT_NAME[district] ?? district;
  return town && town !== d ? `${town}, ${d}` : d;
};

export const rs = (n: number) => `Rs ${new Intl.NumberFormat("en-US").format(n)}`;

/** 1,284 → "1,284" · 12,900 → "12.9K" · 4,200,000 → "4.2M" */
export function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(n >= 100_000 ? 0 : 1)}K`;
  return new Intl.NumberFormat("en-US").format(n);
}
