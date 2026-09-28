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
  Seller,
  Shop,
  ShopProfile,
  ShopReview,
  WantedCardData,
  WantedRequest,
} from "@/types";
import { categories as mockCategories } from "@/data/categories";
import { districts } from "@/data/locations";
import { listings as mockListings } from "@/data/listings";
import { sellerById as mockSellerById } from "@/data/sellers";
import { shops as mockShops } from "@/data/shops";
import { shopProfiles as mockShopProfiles, shopReviews as mockShopReviews } from "@/data/shop-profiles";
import { wantedRequests as mockWanted } from "@/data/wanted";
import { conversations, me, myAdMeta, myListings, notifications } from "@/data/account";
import { bazaars as mockBazaars } from "@/data/bazaars";
import { SUPABASE_ENABLED } from "./supabase";
import { localProducts } from "@/data/local-products";
import { siteImages } from "@/data/media";
import { resolveMedia } from "@/lib/media";
import { timeAgo } from "@/lib/format";

/* ---------- Data source: mock files or Supabase ---------- */

// Every function below reads these. They start as the mock data in /data and
// are replaced by live Supabase rows (refreshed at most once a minute) when
// NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
let categories = mockCategories;
let listings = mockListings;
let sellerById = mockSellerById;
let shops = mockShops;
let shopProfiles = mockShopProfiles;
let shopReviews = mockShopReviews;
let wantedRequests = mockWanted;
let bazaars = mockBazaars;

const REFRESH_MS = 60_000;
let loadedAt = 0;
let loading: Promise<void> | null = null;

async function ready() {
  if (!SUPABASE_ENABLED || Date.now() - loadedAt < REFRESH_MS) return;
  loading ??= (async () => {
    try {
      const { loadRemoteData } = await import("./remote");
      const d = await loadRemoteData();
      categories = d.categories;
      listings = d.listings;
      // The signed-in preview user stays available until real auth is wired
      sellerById = { ...Object.fromEntries(d.sellers.map((x) => [x.id, x])), [me.id]: me };
      shops = d.shops;
      shopProfiles = d.shopProfiles;
      shopReviews = d.shopReviews;
      wantedRequests = d.wantedRequests;
      bazaars = d.bazaars;
      loadedAt = Date.now();
    } catch (err) {
      // Keep serving the last good data (or the mock data) if Supabase is unreachable
      console.error("[data] Supabase load failed:", err);
      loadedAt = Date.now() - REFRESH_MS + 10_000; // retry in 10s
    } finally {
      loading = null;
    }
  })();
  await loading;
}

/** The user's own ads are always included, even before they exist in the database. */
const withMine = () => {
  const ids = new Set(listings.map((l) => l.id));
  return [...listings, ...myListings.filter((l) => !ids.has(l.id))];
};

/** Categories that can be ordered and delivered (never livestock, property, vehicles or services). */
const SHIPPABLE = new Set(["dry-fruits", "agriculture", "electronics", "home", "cameras-gear", "handicrafts"]);

function toCard(l: Listing, now = Date.now()): ListingCardData {
  const s = sellerById[l.sellerId];
  return {
    ...l,
    images: l.images.map(resolveMedia),
    seller: {
      id: s.id,
      type: s.type,
      name: s.name,
      shopSlug: s.shopSlug,
      verifications: s.verifications,
      delivery: s.delivery,
      rating: s.rating,
      reviewCount: s.reviewCount,
      deals: s.deals,
    },
    postedLabel: timeAgo(l.postedAt, now),
    orderable: Boolean(s.type === "shop" && s.acceptsOrders && SHIPPABLE.has(l.category)),
  };
}

const byNewest = (a: Listing, b: Listing) => +new Date(b.postedAt) - +new Date(a.postedAt);

export async function getCategories() {
  await ready();
  return categories.map((c) => (c.image ? { ...c, image: resolveMedia(c.image) } : c));
}

export async function getDistricts() {
  await ready();
  return districts;
}

export async function getSiteImages() {
  await ready();
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
  await ready();
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
  await ready();
  const all = await getListings({ limit: 100 });
  const featuredIds = ["l-1003", "l-1005", "l-1002", "l-1006", "l-1018", "l-1012", "l-1023", "l-1017"];
  const pinned = featuredIds.map((id) => all.find((l) => l.id === id)!).filter(Boolean);
  return [...pinned, ...all.filter((l) => !featuredIds.includes(l.id))].slice(0, limit);
}

/** "Fresh From Gilgit-Baltistan" — signature local produce, one of each. */
export async function getFreshPicks() {
  await ready();
  const ids = ["l-1001", "l-1004", "l-1013", "l-1007", "l-1014", "l-1026"];
  const all = await getListings({ category: "dry-fruits", limit: 100 });
  return ids.map((id) => all.find((l) => l.id === id)!).filter(Boolean);
}

export async function getLivestock(animal?: LivestockAnimal) {
  await ready();
  const items = await getListings({ category: "livestock", limit: 50 });
  return items.filter((l) => l.livestock && (!animal || l.livestock.animal === animal));
}

const resolveShop = (s: Shop): Shop => ({
  ...s,
  cover: resolveMedia(s.cover),
  logo: resolveMedia(s.logo),
  // Count what the shop really has listed, so the card and the shop page agree.
  productCount: listings.filter((l) => l.sellerId === s.sellerId).length || s.productCount,
});

export type ShopSort = "top" | "followers" | "reviews";

export async function getShops(
  opts: { limit?: number; category?: CategorySlug; district?: DistrictSlug; delivery?: boolean; q?: string; sort?: ShopSort } = {},
): Promise<Shop[]> {
  await ready();
  const q = opts.q?.trim().toLowerCase();
  const list = shops
    .filter((s) => !opts.category || s.category === opts.category)
    .filter((s) => !opts.district || s.place.district === opts.district)
    .filter((s) => !opts.delivery || s.delivery)
    .filter((s) => !q || `${s.name} ${s.tagline} ${s.place.town ?? ""}`.toLowerCase().includes(q));
  if (opts.sort === "top") list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  if (opts.sort === "followers") list.sort((a, b) => b.followers - a.followers);
  if (opts.sort === "reviews") list.sort((a, b) => b.reviewCount - a.reviewCount);
  return list.slice(0, opts.limit ?? 20).map(resolveShop);
}

export async function getWantedRequests(limit = 6): Promise<WantedCardData[]> {
  await ready();
  const now = Date.now();
  return wantedRequests.slice(0, limit).map((w) => ({ ...w, postedLabel: timeAgo(w.postedAt, now) }));
}

export async function getBazaars() {
  await ready();
  return bazaars.map((b) => ({ ...b, image: resolveMedia(b.image) }));
}

export async function getLocalProducts() {
  await ready();
  return localProducts.map((p) => ({ ...p, image: resolveMedia(p.image) }));
}

export async function getMarketStats() {
  await ready();
  const activeListings = districts.reduce((n, d) => n + d.activeListings, 0);
  return { activeListings, verifiedShops: 1240, districts: districts.length };
}

/* ---------- Listing detail (Screen 04) ---------- */

export interface ListingDetail {
  listing: ListingCardData;
  seller: Seller;
  category: (typeof categories)[number];
}

/** One listing with its full seller record, or null when the slug doesn't exist. */
export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  await ready();
  const l = withMine().find((x) => x.slug === slug);
  if (!l) return null;
  const seller = sellerById[l.sellerId];
  const category = categories.find((c) => c.slug === l.category)!;
  return { listing: toCard(l), seller, category: category.image ? { ...category, image: resolveMedia(category.image) } : category };
}

export async function getListingSlugs() {
  await ready();
  return listings.map((l) => l.slug);
}

/** Other ads from the same seller (newest first). */
export async function getSellerListings(sellerId: string, exceptId: string, limit = 6) {
  await ready();
  const now = Date.now();
  return listings
    .filter((l) => l.sellerId === sellerId && l.id !== exceptId)
    .sort(byNewest)
    .slice(0, limit)
    .map((l) => toCard(l, now));
}

/** Similar ads: same category first, then same district. */
export async function getSimilarListings(listing: Listing, limit = 6) {
  await ready();
  const now = Date.now();
  const rest = listings.filter((l) => l.id !== listing.id && l.sellerId !== listing.sellerId);
  const same = rest.filter((l) => l.category === listing.category);
  const near = rest.filter((l) => l.category !== listing.category && l.place.district === listing.place.district);
  return [...same, ...near].slice(0, limit).map((l) => toCard(l, now));
}

/* ---------- Shop page (Screen 05) ---------- */

export interface ShopReviewView extends ShopReview {
  itemTitle?: string;
  when: string;
}

export interface ShopDetail {
  shop: Shop;
  seller: Seller;
  profile: ShopProfile;
  products: ListingCardData[];
  reviews: ShopReviewView[];
}

export async function getShopBySlug(slug: string): Promise<ShopDetail | null> {
  await ready();
  const raw = shops.find((s) => s.slug === slug);
  if (!raw) return null;
  const now = Date.now();
  const products = listings
    .filter((l) => l.sellerId === raw.sellerId)
    .sort(byNewest)
    .map((l) => toCard(l, now));
  const reviews = shopReviews
    .filter((r) => r.shopId === raw.id)
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
    .map((r) => ({
      ...r,
      itemTitle: r.item ? listings.find((l) => l.slug === r.item)?.title : undefined,
      when: timeAgo(r.postedAt, now),
    }));
  return { shop: resolveShop(raw), seller: sellerById[raw.sellerId], profile: shopProfiles[raw.id], products, reviews };
}

export async function getShopSlugs() {
  await ready();
  return shops.map((s) => s.slug);
}

/** Other shops: same category first, then the same district, then the rest. */
export async function getSimilarShops(shop: Shop, limit = 4) {
  await ready();
  const rest = shops.filter((s) => s.id !== shop.id);
  const score = (s: Shop) => (s.category === shop.category ? 2 : 0) + (s.place.district === shop.place.district ? 1 : 0);
  return [...rest].sort((a, b) => score(b) - score(a) || b.rating - a.rating).slice(0, limit).map(resolveShop);
}

/* ---------- Search results (Screen 03) ---------- */

export type SearchSort = "relevance" | "newest" | "price-low" | "price-high" | "popular";

export interface SearchQuery {
  q?: string;
  category?: CategorySlug;
  district?: DistrictSlug;
  seller?: "shop" | "individual";
  condition?: "new" | "used";
  min?: number;
  max?: number;
  delivery?: boolean;
  wholesale?: boolean;
  negotiable?: boolean;
  verified?: boolean;
  sort?: SearchSort;
  page?: number;
}

export interface SearchResult {
  items: ListingCardData[];
  total: number;
  page: number;
  pages: number;
  perPage: number;
  /** Counts per option, each ignoring its own filter (so you can switch) */
  facets: {
    categories: Partial<Record<CategorySlug, number>>;
    districts: Partial<Record<DistrictSlug, number>>;
    seller: { shop: number; individual: number };
  };
  /** Cheapest and dearest price among the matches (for the price filter hint) */
  priceRange: { min: number; max: number } | null;
}

/** Local words people type → words that appear in our ads. */
const SYNONYMS: Record<string, string[]> = {
  khubani: ["apricot"], khobani: ["apricot"], chuli: ["apricot"], apricots: ["apricot"],
  akhrot: ["walnut"], walnuts: ["walnut"], maghz: ["walnut"],
  badam: ["almond"], almonds: ["almond"],
  toot: ["mulberry"], shahtoot: ["mulberry"],
  kishmish: ["raisin"], raisins: ["raisin"],
  shahad: ["honey"], shehad: ["honey"],
  bakri: ["goat"], bakra: ["goat"], goats: ["goat"],
  bhed: ["sheep"], dumba: ["sheep"],
  gaye: ["cow"], gai: ["cow"], cows: ["cow"],
  murghi: ["hen", "poultry"], hens: ["hen"],
  plot: ["land", "kanal"], zameen: ["land"], zamin: ["land"],
  makan: ["house"], ghar: ["house"], kiraya: ["rent"], rent: ["rent"],
  gari: ["car", "vehicles", "toyota", "honda", "suzuki"], gaari: ["car", "vehicles"], car: ["car", "vehicles", "toyota", "honda", "suzuki"],
  jeep: ["jeep", "4x4", "cruiser"], bike: ["honda cd", "motorcycle"], motorcycle: ["honda cd"],
  mobile: ["phone", "iphone", "samsung", "galaxy"], phone: ["phone", "iphone", "samsung", "galaxy"],
  laptop: ["macbook", "laptop"], camera: ["camera", "canon"],
  tent: ["tent", "camping"], shawl: ["shawl", "pattu"], topi: ["cap"], cap: ["cap"],
  tractor: ["tractor", "massey"], aloo: ["potato"], potatoes: ["potato"],
};
const STOP = new Set(["in", "for", "the", "a", "an", "of", "and", "ka", "ki", "ke", "sale", "buy"]);

function haystack(l: Listing) {
  const s = sellerById[l.sellerId];
  const c = categories.find((x) => x.slug === l.category);
  const d = districts.find((x) => x.slug === l.place.district);
  return [
    l.title, l.tag, c?.shortName, d?.name, l.place.town, s?.name,
    l.livestock?.breed, l.livestock?.animal, ...Object.values(l.attributes ?? {}).map(String),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Every word must match (itself or one of its local synonyms). Returns a relevance score, 0 = no match. */
function matchScore(l: Listing, words: string[]) {
  if (!words.length) return 1;
  const hay = haystack(l);
  const title = l.title.toLowerCase();
  let score = 0;
  for (const w of words) {
    const variants = [w, ...(SYNONYMS[w] ?? [])];
    // Whole words (plural ok): "car" finds "cars" but never "carved".
    // What the user typed may also be the start of a word ("khuba" → khubani) once it's 4+ letters.
    const esc = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const at = (text: string, v: string, prefix: boolean) =>
      new RegExp(`(^|[^a-z0-9])${esc(v)}${prefix ? "" : "(s|es)?($|[^a-z0-9])"}`).test(text);
    const hit = variants.find((v) => at(hay, v, v === w && w.length >= 4));
    if (!hit) return 0;
    score += at(title, hit, hit === w && w.length >= 4) ? 3 : 1;
  }
  return score;
}

export async function searchListings(query: SearchQuery, perPage = 24): Promise<SearchResult> {
  await ready();
  const now = Date.now();
  const words = (query.q ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));

  const scored = listings
    .map((l) => ({ l, score: matchScore(l, words) }))
    .filter((x) => x.score > 0);

  type Key = "category" | "district" | "seller";
  const pass = (l: Listing, skip?: Key) => {
    const s = sellerById[l.sellerId];
    const card = toCard(l, now);
    if (skip !== "category" && query.category && l.category !== query.category) return false;
    if (skip !== "district" && query.district && l.place.district !== query.district) return false;
    if (skip !== "seller" && query.seller && s.type !== query.seller) return false;
    if (query.condition === "new" && l.condition !== "new") return false;
    if (query.condition === "used" && !(l.condition && l.condition !== "new")) return false;
    if (query.min !== undefined && l.price.amount < query.min) return false;
    if (query.max !== undefined && l.price.amount > query.max) return false;
    if (query.delivery && !card.orderable) return false;
    if (query.wholesale && !l.wholesale) return false;
    if (query.negotiable && !l.price.negotiable) return false;
    if (query.verified && !s.verifications.some((v) => v === "identity" || v === "business")) return false;
    return true;
  };

  const facets: SearchResult["facets"] = { categories: {}, districts: {}, seller: { shop: 0, individual: 0 } };
  for (const { l } of scored) {
    if (pass(l, "category")) facets.categories[l.category] = (facets.categories[l.category] ?? 0) + 1;
    if (pass(l, "district")) facets.districts[l.place.district] = (facets.districts[l.place.district] ?? 0) + 1;
    if (pass(l, "seller")) facets.seller[sellerById[l.sellerId].type] += 1;
  }

  const hits = scored.filter((x) => pass(x.l));
  const featured = new Set(["l-1003", "l-1005", "l-1002", "l-1006", "l-1018", "l-1012", "l-1023", "l-1017"]);
  const sorters: Record<SearchSort, (a: (typeof hits)[number], b: (typeof hits)[number]) => number> = {
    relevance: (a, b) =>
      b.score - a.score ||
      Number(featured.has(b.l.id)) - Number(featured.has(a.l.id)) ||
      +new Date(b.l.postedAt) - +new Date(a.l.postedAt),
    newest: (a, b) => +new Date(b.l.postedAt) - +new Date(a.l.postedAt),
    "price-low": (a, b) => a.l.price.amount - b.l.price.amount,
    "price-high": (a, b) => b.l.price.amount - a.l.price.amount,
    popular: (a, b) => b.l.views - a.l.views,
  };
  hits.sort(sorters[query.sort ?? "relevance"]);

  const total = hits.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const items = hits.slice((page - 1) * perPage, page * perPage).map((x) => toCard(x.l, now));
  const amounts = hits.map((x) => x.l.price.amount);
  return {
    items,
    total,
    page,
    pages,
    perPage,
    facets,
    priceRange: amounts.length ? { min: Math.min(...amounts), max: Math.max(...amounts) } : null,
  };
}

/* ---------- Wanted (buyer requests) ---------- */

export async function getAllWanted(opts: { category?: CategorySlug; mode?: WantedRequest["mode"] } = {}): Promise<WantedCardData[]> {
  await ready();
  const now = Date.now();
  return wantedRequests
    .filter((w) => !opts.category || w.category === opts.category)
    .filter((w) => !opts.mode || w.mode === opts.mode)
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt))
    .map((w) => ({ ...w, postedLabel: timeAgo(w.postedAt, now) }));
}

export async function getWantedBySlug(slug: string) {
  await ready();
  const now = Date.now();
  const w = wantedRequests.find((x) => x.slug === slug);
  if (!w) return null;
  const request: WantedCardData = { ...w, postedLabel: timeAgo(w.postedAt, now) };
  const related = wantedRequests
    .filter((x) => x.id !== w.id)
    .sort((a, b) => Number(b.category === w.category) - Number(a.category === w.category))
    .slice(0, 3)
    .map((x) => ({ ...x, postedLabel: timeAgo(x.postedAt, now) }));
  // Ads that could answer the request right now
  const matching = listings
    .filter((l) => l.category === w.category)
    .sort(byNewest)
    .slice(0, 4)
    .map((l) => toCard(l, now));
  return { request, related, matching };
}

export async function getWantedSlugs() {
  await ready();
  return wantedRequests.map((w) => w.slug);
}

/* ---------- Bazaars ---------- */

export async function getBazaarBySlug(slug: string) {
  await ready();
  const b = bazaars.find((x) => x.slug === slug);
  if (!b) return null;
  const now = Date.now();
  const bazaarShops = shops.filter((s) => s.bazaar === b.slug || (!s.bazaar && s.place.district === b.district)).map(resolveShop);
  const shopSellerIds = new Set(bazaarShops.map((s) => s.sellerId));
  const inDistrict = listings.filter((l) => l.place.district === b.district);
  // Shop stock first, then everything else posted in the same district
  const items = [...inDistrict]
    .sort((x, y) => Number(shopSellerIds.has(y.sellerId)) - Number(shopSellerIds.has(x.sellerId)) || byNewest(x, y))
    .map((l) => toCard(l, now));
  const others = bazaars.filter((x) => x.slug !== b.slug).map((x) => ({ ...x, image: resolveMedia(x.image) }));
  return { bazaar: { ...b, image: resolveMedia(b.image) }, shops: bazaarShops, listings: items, others };
}

export async function getBazaarSlugs() {
  await ready();
  return bazaars.map((b) => b.slug);
}

/* ---------- Every ad as a card (Saved page reads ids from the device) ---------- */

export async function getAllListingCards() {
  await ready();
  const now = Date.now();
  return withMine().map((l) => toCard(l, now));
}

/* ---------- The signed-in preview user ---------- */

export async function getAccount() {
  await ready();
  const now = Date.now();
  const ads = myListings.map((l) => ({ ...toCard(l, now), meta: myAdMeta[l.id] }));
  const unread = conversations.reduce((n, c) => n + c.unread, 0);
  return { me, ads, unreadMessages: unread, unreadNotifications: notifications.filter((n) => !n.read).length };
}

export async function getConversations() {
  await ready();
  const now = Date.now();
  return conversations.map((c) => {
    const l = withMine().find((x) => x.slug === c.listingSlug)!;
    return { ...c, listing: toCard(l, now) };
  });
}

export async function getNotifications() {
  await ready();
  const now = Date.now();
  return notifications
    .map((n) => ({ ...n, when: timeAgo(n.at, now) }))
    .sort((a, b) => +new Date(b.at) - +new Date(a.at));
}

/* ---------- Categories page ---------- */

/** Live ad count per category, plus a few example titles. */
export async function getCategoryOverview() {
  await ready();
  return categories.map((c) => {
    const items = listings.filter((l) => l.category === c.slug).sort(byNewest);
    return {
      ...c,
      image: c.image ? resolveMedia(c.image) : undefined,
      count: items.length,
      examples: items.slice(0, 3).map((l) => ({ slug: l.slug, title: l.title })),
    };
  });
}

/* ---------- Seller profile ---------- */

export async function getSellerProfile(id: string) {
  await ready();
  const seller = sellerById[id];
  if (!seller) return null;
  const now = Date.now();
  const ads = withMine().filter((l) => l.sellerId === id).sort(byNewest).map((l) => toCard(l, now));
  return { seller, ads };
}

/* ---------- Admin: the raw public data (lib/admin/data.ts builds its views from this) ---------- */

export async function getAdminSnapshot() {
  await ready();
  return {
    listings: withMine(),
    sellers: Object.values(sellerById),
    shops: shops.map(resolveShop),
    shopReviews,
    wantedRequests,
    categories,
    bazaars: bazaars.map((b) => ({ ...b, image: resolveMedia(b.image) })),
    districts,
  };
}
