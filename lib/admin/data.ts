import type { Listing, Media, Seller } from "@/types";
import type {
  AdminBazaar,
  AdminCategory,
  AdminDistrict,
  AdminListing,
  AdminPost,
  AdminReview,
  AdminShop,
  AdminUser,
  AdminWanted,
  OverviewData,
} from "./types";
import { getAdminSnapshot } from "@/lib/data";
import { formatBudget } from "@/lib/format";
import { resolveMedia } from "@/lib/media";
import * as A from "@/data/admin";
import { posts } from "@/data/blog";

/**
 * Admin data access. Pages call these; today they combine the public data
 * (mock or Supabase, via lib/data) with the admin-only preview rows in
 * data/admin.ts. With Supabase Auth each function becomes one query that
 * runs as the signed-in admin (RLS policies in the admin migration).
 */

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/** Small thumbnails straight from the image CDN (no server resize needed). */
export function thumb(media: Media | undefined | null, w = 160): string | null {
  if (!media) return null;
  const m = resolveMedia(media);
  if (!m.src) return null;
  if (m.src.includes("images.unsplash.com")) return m.src.replace(/([?&])w=\d+/, `$1w=${w}`).replace(/q=\d+/, "q=70");
  return m.src;
}

const isVerified = (s?: Seller) => Boolean(s?.verifications.includes("identity") || s?.verifications.includes("business"));

/* ---------- Ads ---------- */

export async function getAdminListings(): Promise<AdminListing[]> {
  const snap = await getAdminSnapshot();
  const sellers = Object.fromEntries([...snap.sellers, ...A.buyers].map((s) => [s.id, s]));
  const toRow = (l: Listing, extra: Partial<AdminListing> = {}): AdminListing => {
    const s = sellers[l.sellerId];
    const o = A.listingStatusOverrides[l.id];
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      category: l.category,
      district: l.place.district,
      town: l.place.town,
      price: l.price.amount,
      unit: l.price.unit,
      image: thumb(l.images[0]),
      sellerId: l.sellerId,
      sellerName: s?.name ?? "Unknown",
      sellerVerified: isVerified(s),
      isShop: s?.type === "shop",
      status: o?.status ?? "active",
      postedAt: l.postedAt,
      views: l.views,
      reports: A.listingReports[l.id] ?? 0,
      flags: [],
      reason: o?.reason,
      ...extra,
    };
  };
  const pending = A.pendingListings.map((l) => toRow(l, { status: "pending", flags: l.flags, description: l.description }));
  const live = snap.listings.filter((l) => !A.pendingListings.some((p) => p.id === l.id)).map((l) => toRow(l));
  return [...pending, ...live].sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
}

/* ---------- Shops ---------- */

export async function getAdminShops(): Promise<AdminShop[]> {
  const snap = await getAdminSnapshot();
  const sellers = Object.fromEntries([...snap.sellers, ...A.buyers].map((s) => [s.id, s]));
  const live: AdminShop[] = snap.shops.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    category: s.category,
    district: s.place.district,
    town: s.place.town,
    logo: thumb(s.logo, 120),
    monogram: s.monogram,
    ownerId: s.sellerId,
    ownerName: sellers[s.sellerId]?.name ?? s.name,
    verifications: s.verifications,
    status: A.shopStatusOverrides[s.id]?.status ?? "active",
    reason: A.shopStatusOverrides[s.id]?.reason,
    rating: s.rating,
    reviewCount: s.reviewCount,
    followers: s.followers,
    products: s.productCount,
    acceptsOrders: s.acceptsOrders,
    delivery: s.delivery,
    createdAt: (sellers[s.sellerId]?.memberSince ?? "2024-01-01") + "T09:00:00.000Z",
  }));
  const pending: AdminShop[] = A.pendingShops.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    category: s.category,
    district: s.place.district,
    town: s.place.town,
    logo: null,
    monogram: s.monogram,
    ownerId: s.sellerId,
    ownerName: s.ownerName,
    verifications: s.verifications,
    status: "pending",
    rating: 0,
    reviewCount: 0,
    followers: 0,
    products: 0,
    acceptsOrders: false,
    delivery: s.delivery,
    createdAt: s.createdAt,
    documents: s.documents,
  }));
  return [...pending, ...live];
}

/* ---------- Users ---------- */

export async function getAdminUsers(): Promise<AdminUser[]> {
  const snap = await getAdminSnapshot();
  const adCount: Record<string, number> = {};
  for (const l of snap.listings) adCount[l.sellerId] = (adCount[l.sellerId] ?? 0) + 1;
  for (const l of A.pendingListings) adCount[l.sellerId] = (adCount[l.sellerId] ?? 0) + 1;
  const people = [...snap.sellers, ...A.buyers.filter((b) => !snap.sellers.some((s) => s.id === b.id))];
  return people
    .map((s, i): AdminUser => {
      const meta = A.userMeta[s.id];
      return {
        id: s.id,
        name: s.name,
        phone: s.phoneMasked,
        type: s.id.startsWith("b-") ? "buyer" : s.type,
        district: s.place.district,
        town: s.place.town,
        verifications: s.verifications,
        status: meta?.status ?? "active",
        reason: meta?.reason,
        joinedAt: s.memberSince + "T09:00:00.000Z",
        lastActive: minsAgo(meta?.lastActiveMins ?? 45 + ((i * 397) % 4000)),
        ads: adCount[s.id] ?? 0,
        reports: meta?.reports ?? 0,
        deals: s.deals ?? 0,
        shopSlug: s.shopSlug,
      };
    })
    .sort((a, b) => +new Date(b.joinedAt) - +new Date(a.joinedAt));
}

export async function getAdminVerifications() {
  return A.verifications;
}

export async function getAdminReports() {
  return A.reports;
}

/* ---------- Reviews ---------- */

export async function getAdminReviews(): Promise<AdminReview[]> {
  const snap = await getAdminSnapshot();
  const shopById = Object.fromEntries(snap.shops.map((s) => [s.id, s]));
  return [...A.extraReviews, ...snap.shopReviews]
    .map((r) => ({
      id: r.id,
      shopId: r.shopId,
      shopName: shopById[r.shopId]?.name ?? "Shop",
      shopSlug: shopById[r.shopId]?.slug ?? "",
      author: r.author,
      from: r.from,
      rating: r.rating,
      text: r.text,
      postedAt: r.postedAt,
      reply: "reply" in r ? r.reply : undefined,
      status: A.reviewStatus[r.id]?.status ?? "published",
      flagReason: A.reviewStatus[r.id]?.flagReason,
    }))
    .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
}

/* ---------- Wanted ---------- */

export async function getAdminWanted(): Promise<AdminWanted[]> {
  const snap = await getAdminSnapshot();
  return snap.wantedRequests.map((w) => ({
    id: w.id,
    slug: w.slug,
    title: w.title,
    category: w.category,
    district: w.place.district,
    buyerName: w.buyerName,
    buyerVerified: w.buyerVerified,
    budget: formatBudget(w.budget),
    mode: w.mode,
    offers: w.offers,
    status: "open",
    postedAt: w.postedAt,
  }));
}

/* ---------- Orders & inbox ---------- */

export async function getAdminOrders() {
  const snap = await getAdminSnapshot();
  const shopById = Object.fromEntries(snap.shops.map((s) => [s.id, s.name]));
  return A.orders.map((o) => ({ ...o, shopName: shopById[o.shopId] ?? "Shop" }));
}

export async function getAdminInbox() {
  return A.inbox;
}

export async function getAdminBroadcasts() {
  return A.broadcasts;
}

/* ---------- Content ---------- */

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const snap = await getAdminSnapshot();
  return snap.categories.map((c, i) => ({
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    description: c.description,
    icon: c.icon3d?.src ?? null,
    ads: snap.listings.filter((l) => l.category === c.slug).length,
    visible: true,
    sort: i + 1,
  }));
}

export async function getAdminBazaars(): Promise<AdminBazaar[]> {
  const snap = await getAdminSnapshot();
  return snap.bazaars.map((b) => ({
    slug: b.slug,
    name: b.name,
    district: b.district,
    town: b.town,
    description: b.description,
    image: thumb(b.image, 240),
    shops: b.shopCount,
    products: b.productCount,
    visible: true,
  }));
}

export async function getAdminDistricts(): Promise<AdminDistrict[]> {
  const snap = await getAdminSnapshot();
  return snap.districts.map((d) => ({
    slug: d.slug,
    name: d.name,
    division: d.division,
    headquarters: d.headquarters,
    tehsils: d.tehsils.map((t) => ({ name: t.name, towns: t.towns.length })),
    ads: snap.listings.filter((l) => l.place.district === d.slug).length,
  }));
}

export async function getAdminPosts(): Promise<AdminPost[]> {
  const live: AdminPost[] = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: p.category,
    cover: thumb(p.cover, 240),
    date: p.date,
    readMins: p.readMins,
    status: "published",
    author: "REGOMARKET team",
  }));
  const draft: AdminPost = {
    slug: "winter-livestock-care-gb",
    title: "Keeping goats and sheep healthy through a GB winter",
    excerpt: "Feed, shelter and vaccines before the passes close.",
    category: "Guides",
    cover: null,
    date: new Date().toISOString().slice(0, 10),
    readMins: 5,
    status: "draft",
    author: "Ayesha Noor",
  };
  return [draft, ...live];
}

export async function getAdminTeam() {
  return A.team;
}

export async function getAuditLog() {
  return A.auditLog;
}

/* ---------- Overview ---------- */

/** Deterministic wobble so the preview charts look alive but never change on refresh. */
function wave(seed: number, i: number) {
  const x = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export async function getOverview(): Promise<OverviewData> {
  const snap = await getAdminSnapshot();
  const [users, orders] = [await getAdminUsers(), await getAdminOrders()];

  const days = 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getTime() - (days - 1 - i) * 86_400_000);
    const weekend = d.getDay() === 5 ? 0.8 : 1; // quieter on Fridays
    const trend = 0.75 + (i / days) * 0.5;
    return {
      date: d.toISOString().slice(0, 10),
      ads: Math.round((6 + wave(1, i) * 9) * trend * weekend),
      users: Math.round((3 + wave(2, i) * 6) * trend),
    };
  });
  const sum = (a: number[]) => a.reduce((n, x) => n + x, 0);
  const last7 = daily.slice(-7);
  const prev7 = daily.slice(-14, -7);
  const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0);

  const liveAds = snap.listings.length;
  const gmv = orders.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);

  return {
    kpis: [
      { key: "ads", label: "Live ads", value: liveAds, delta: pct(sum(last7.map((d) => d.ads)), sum(prev7.map((d) => d.ads))), series: daily.map((d) => d.ads) },
      { key: "users", label: "Users", value: users.length, delta: pct(sum(last7.map((d) => d.users)), sum(prev7.map((d) => d.users))), series: daily.map((d) => d.users) },
      { key: "shops", label: "Verified shops", value: snap.shops.length, delta: 12, series: daily.map((_, i) => 5 + Math.floor(i / 6)) },
      { key: "gmv", label: "Order value (30 days)", value: gmv, delta: 18, series: daily.map((_, i) => Math.round(8000 + wave(3, i) * 22000)), format: "rs" },
    ],
    daily,
    byCategory: snap.categories
      .map((c) => ({ slug: c.slug, name: c.shortName, ads: snap.listings.filter((l) => l.category === c.slug).length }))
      .sort((a, b) => b.ads - a.ads),
    byDistrict: snap.districts
      .map((d) => ({ slug: d.slug, name: d.name, ads: snap.listings.filter((l) => l.place.district === d.slug).length }))
      .sort((a, b) => b.ads - a.ads),
  };
}

/** Counts shown as sidebar badges (items waiting for action). */
export async function getQueues() {
  const [listings, shops, reviews] = await Promise.all([getAdminListings(), getAdminShops(), getAdminReviews()]);
  return {
    listings: listings.filter((l) => l.status === "pending").map((l) => l.id),
    shops: shops.filter((s) => s.status === "pending").map((s) => s.id),
    verifications: A.verifications.filter((v) => v.status === "pending").map((v) => v.id),
    reports: A.reports.filter((r) => r.status === "open" || r.status === "reviewing").map((r) => r.id),
    reviews: reviews.filter((r) => r.status === "flagged").map((r) => r.id),
    orders: A.orders.filter((o) => o.status === "placed").map((o) => o.id),
    inbox: A.inbox.filter((m) => m.status === "new").map((m) => m.id),
  };
}

export type Queues = Awaited<ReturnType<typeof getQueues>>;
