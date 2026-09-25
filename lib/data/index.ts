/**
 * Data access layer.
 *
 * Every page/section reads data through these async functions — never by
 * importing /data directly — so the mock implementation can be replaced with
 * Supabase queries (see ./supabase.ts) without touching any component.
 */
import type {
  CategorySlug,
  DistrictSlug,
  Listing,
  ListingCardData,
  LivestockAnimal,
  Shop,
  WantedCardData,
} from "@/types";
import { categories } from "@/data/categories";
import { districts } from "@/data/locations";
import { listings } from "@/data/listings";
import { sellerById } from "@/data/sellers";
import { shops } from "@/data/shops";
import { wantedRequests } from "@/data/wanted";
import { bazaars } from "@/data/bazaars";
import { localProducts } from "@/data/local-products";
import { siteImages } from "@/data/media";
import { resolveMedia } from "@/lib/media";
import { timeAgo } from "@/lib/format";

/** Categories that can be ordered and delivered (never livestock, property, vehicles or services). */
const SHIPPABLE = new Set(["dry-fruits", "agriculture", "electronics", "home", "cameras-gear", "handicrafts"]);

function toCard(l: Listing, now = Date.now()): ListingCardData {
  const s = sellerById[l.sellerId];
  return {
    ...l,
    images: l.images.map(resolveMedia),
    seller: { id: s.id, type: s.type, name: s.name, shopSlug: s.shopSlug, verifications: s.verifications, delivery: s.delivery },
    postedLabel: timeAgo(l.postedAt, now),
    orderable: Boolean(s.type === "shop" && s.acceptsOrders && SHIPPABLE.has(l.category)),
  };
}

const byNewest = (a: Listing, b: Listing) => +new Date(b.postedAt) - +new Date(a.postedAt);

export async function getCategories() {
  return categories.map((c) => (c.image ? { ...c, image: resolveMedia(c.image) } : c));
}

export async function getDistricts() {
  return districts;
}

export async function getSiteImages() {
  return Object.fromEntries(
    Object.entries(siteImages).map(([k, v]) => [k, resolveMedia(v)]),
  ) as typeof siteImages;
}

export async function getListings(opts: {
  category?: CategorySlug;
  district?: DistrictSlug;
  sellerType?: "shop" | "individual";
  limit?: number;
} = {}): Promise<ListingCardData[]> {
  const now = Date.now();
  return listings
    .filter((l) => !opts.category || l.category === opts.category)
    .filter((l) => !opts.district || l.place.district === opts.district)
    .filter((l) => !opts.sellerType || sellerById[l.sellerId]?.type === opts.sellerType)
    .sort(byNewest)
    .slice(0, opts.limit ?? 24)
    .map((l) => toCard(l, now));
}

/** Home "Featured Listings" — curated order: featured first, then newest. */
export async function getFeaturedListings(limit = 24) {
  const all = await getListings({ limit: 100 });
  const featuredIds = ["l-1003", "l-1005", "l-1002", "l-1006", "l-1018", "l-1012", "l-1023", "l-1017"];
  const pinned = featuredIds.map((id) => all.find((l) => l.id === id)!).filter(Boolean);
  return [...pinned, ...all.filter((l) => !featuredIds.includes(l.id))].slice(0, limit);
}

/** "Fresh From Gilgit-Baltistan" — signature local produce, one of each. */
export async function getFreshPicks() {
  const ids = ["l-1001", "l-1004", "l-1013", "l-1007", "l-1014", "l-1026"];
  const all = await getListings({ category: "dry-fruits", limit: 100 });
  return ids.map((id) => all.find((l) => l.id === id)!).filter(Boolean);
}

export async function getLivestock(animal?: LivestockAnimal) {
  const items = await getListings({ category: "livestock", limit: 50 });
  return items.filter((l) => l.livestock && (!animal || l.livestock.animal === animal));
}

export async function getShops(opts: { limit?: number; category?: CategorySlug } = {}): Promise<Shop[]> {
  return shops
    .filter((s) => !opts.category || s.category === opts.category)
    .slice(0, opts.limit ?? 20)
    .map((s) => ({ ...s, cover: resolveMedia(s.cover), logo: resolveMedia(s.logo) }));
}

export async function getWantedRequests(limit = 6): Promise<WantedCardData[]> {
  const now = Date.now();
  return wantedRequests.slice(0, limit).map((w) => ({ ...w, postedLabel: timeAgo(w.postedAt, now) }));
}

export async function getBazaars() {
  return bazaars.map((b) => ({ ...b, image: resolveMedia(b.image) }));
}

export async function getLocalProducts() {
  return localProducts.map((p) => ({ ...p, image: resolveMedia(p.image) }));
}

export async function getMarketStats() {
  const activeListings = districts.reduce((n, d) => n + d.activeListings, 0);
  return { activeListings, verifiedShops: 1240, districts: districts.length };
}
