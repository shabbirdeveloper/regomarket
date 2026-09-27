import type { CategorySlug, DistrictSlug } from "@/types";
import type { SearchQuery, SearchSort } from "@/lib/data";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";

export type RawParams = Record<string, string | string[] | undefined>;

export const SEARCH_SORTS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest first" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "popular", label: "Most viewed" },
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const num = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

/** URL → a clean, validated query (unknown values are dropped). */
export function parseSearch(sp: RawParams): SearchQuery {
  const category = one(sp.category);
  const district = one(sp.district);
  const seller = one(sp.seller);
  const condition = one(sp.condition);
  const sort = one(sp.sort);
  return {
    q: one(sp.q)?.slice(0, 80),
    category: category && category in categoryBySlug ? (category as CategorySlug) : undefined,
    district: district && district in districtBySlug ? (district as DistrictSlug) : undefined,
    seller: seller === "shop" || seller === "individual" ? seller : undefined,
    condition: condition === "new" || condition === "used" ? condition : undefined,
    min: num(one(sp.min)),
    max: num(one(sp.max)),
    delivery: ["1", "true"].includes(one(sp.delivery) ?? "") || undefined,
    wholesale: ["1", "true"].includes(one(sp.wholesale) ?? "") || undefined,
    negotiable: ["1", "true"].includes(one(sp.negotiable) ?? "") || undefined,
    verified: ["1", "true"].includes(one(sp.verified) ?? "") || undefined,
    sort: SEARCH_SORTS.some((s) => s.value === sort) && sort !== "relevance" ? (sort as SearchSort) : undefined,
    page: num(one(sp.page)),
  };
}

/** Query (+ a change) → "/search?…". Changing any filter resets the page. */
export function searchHref(query: SearchQuery, change: Partial<Record<keyof SearchQuery, unknown>> = {}) {
  const next: Record<string, unknown> = { ...query, ...change };
  if (!("page" in change)) delete next.page;
  const qs = new URLSearchParams();
  const order: (keyof SearchQuery)[] = ["q", "category", "district", "seller", "condition", "min", "max", "delivery", "wholesale", "negotiable", "verified", "sort", "page"];
  for (const k of order) {
    const v = next[k];
    if (v === undefined || v === null || v === "" || v === false) continue;
    if (k === "page" && v === 1) continue;
    qs.set(k, v === true ? "1" : String(v));
  }
  const s = qs.toString();
  return s ? `/search?${s}` : "/search";
}

/** Number of filters in use (not counting the words or the sort). */
export function activeFilterCount(q: SearchQuery) {
  return [q.category, q.district, q.seller, q.condition, q.min, q.max, q.delivery, q.wholesale, q.negotiable, q.verified].filter(
    (v) => v !== undefined,
  ).length;
}
