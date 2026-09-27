/**
 * Loads the public marketplace data from Supabase and maps the rows to the
 * same TypeScript shapes as the mock files in /data. lib/data/index.ts swaps
 * its source to this when NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set.
 *
 * Uses the anonymous key only (no cookies), so pages stay cacheable (ISR).
 * Row Level Security decides what is visible: live ads, active shops, open requests.
 */
import { createClient } from "@supabase/supabase-js";
import type {
  Bazaar,
  Category,
  Listing,
  Seller,
  Shop,
  ShopProfile,
  ShopReview,
  WantedRequest,
} from "@/types";
import { categories as mockCategories } from "@/data/categories";
import { bazaars as mockBazaars } from "@/data/bazaars";
import { shops as mockShops } from "@/data/shops";

export interface RemoteData {
  categories: Category[];
  listings: Listing[];
  sellers: Seller[];
  shops: Shop[];
  shopProfiles: Record<string, ShopProfile>;
  shopReviews: ShopReview[];
  wantedRequests: WantedRequest[];
  bazaars: Bazaar[];
}

type Row = Record<string, unknown>;
const s = (v: unknown) => (v === null || v === undefined ? undefined : String(v));
const n = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));
const photo = (url: unknown, alt = "") => ({ src: s(url) ?? null, alt });

export function supabasePublic() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function loadRemoteData(): Promise<RemoteData> {
  const db = supabasePublic();
  const [cats, lst, sel, shp, rev, wnt, bz] = await Promise.all([
    db.from("categories").select("*").order("sort"),
    db.from("listings").select("*").eq("status", "active").order("posted_at", { ascending: false }).limit(2000),
    db.from("sellers").select("*").limit(5000),
    db.from("shops").select("*").eq("status", "active"),
    db.from("shop_reviews").select("*").order("posted_at", { ascending: false }).limit(2000),
    db.from("wanted_requests").select("*").eq("status", "open").order("posted_at", { ascending: false }).limit(500),
    db.from("bazaars").select("*"),
  ]);
  for (const r of [cats, lst, sel, shp, rev, wnt, bz]) if (r.error) throw r.error;

  // Design-only fields (icons, artwork seeds, tints) still come from the code
  const catMock = Object.fromEntries(mockCategories.map((c) => [c.slug, c]));
  const bzMock = Object.fromEntries(mockBazaars.map((b) => [b.slug, b]));
  const shopMock = Object.fromEntries(mockShops.map((x) => [x.slug, x]));

  const categories: Category[] = (cats.data as Row[]).map((r) => {
    const base = catMock[s(r.slug)!];
    return {
      ...(base ?? { tint: "#f3f1ec", activeListings: 0 }),
      slug: r.slug as Category["slug"],
      name: s(r.name)!,
      shortName: s(r.short_name)!,
      icon: r.icon as Category["icon"],
      description: s(r.description) ?? "",
      image: r.image_url ? photo(r.image_url) : base?.image,
    } as Category;
  });

  const listings: Listing[] = (lst.data as Row[]).map((r) => ({
    id: s(r.id)!,
    slug: s(r.slug)!,
    title: s(r.title)!,
    category: r.category as Listing["category"],
    place: { district: r.district as Listing["place"]["district"], tehsil: s(r.tehsil), town: s(r.town) },
    price: { amount: Number(r.price), unit: (s(r.unit) as Listing["price"]["unit"]) ?? undefined, negotiable: Boolean(r.negotiable) || undefined },
    images: ((r.images as { src: string; alt?: string }[]) ?? []).map((m) => photo(m.src, m.alt ?? "")),
    badges: (r.badges as Listing["badges"]) ?? [],
    tag: s(r.tag),
    condition: (s(r.condition) as Listing["condition"]) ?? undefined,
    wholesale: Boolean(r.wholesale) || undefined,
    delivery: Boolean(r.delivery) || undefined,
    sellerId: s(r.seller_id)!,
    postedAt: s(r.posted_at)!,
    views: Number(r.views ?? 0),
    livestock: (r.livestock as Listing["livestock"]) ?? undefined,
    produce: (r.produce as Listing["produce"]) ?? undefined,
    attributes: (r.attributes as Listing["attributes"]) ?? undefined,
  }));

  const sellers: Seller[] = (sel.data as Row[]).map((r) => ({
    id: s(r.id)!,
    type: r.type as Seller["type"],
    name: s(r.name)!,
    shopSlug: s(r.shop_slug),
    verifications: (r.verifications as Seller["verifications"]) ?? [],
    memberSince: s(r.member_since)!,
    place: { district: (r.district ?? "gilgit") as Seller["place"]["district"], tehsil: s(r.tehsil), town: s(r.town) },
    phoneMasked: s(r.phone_masked) ?? "",
    whatsapp: Boolean(r.whatsapp),
    rating: n(r.rating),
    reviewCount: n(r.review_count),
    responseTime: s(r.response_time),
    acceptsOrders: Boolean(r.accepts_orders),
    delivery: Boolean(r.delivery),
    deals: n(r.deals),
  }));

  const shopProfiles: Record<string, ShopProfile> = {};
  const shops: Shop[] = (shp.data as Row[]).map((r) => {
    const base = shopMock[s(r.slug)!];
    shopProfiles[s(r.id)!] = {
      about: (r.about as string[]) ?? [],
      founded: n(r.founded) ?? new Date(s(r.created_at) ?? Date.now()).getFullYear(),
      payments: (r.payments as ShopProfile["payments"]) ?? ["Cash on delivery"],
      deliveryNote: s(r.delivery_note) ?? "",
      highlights: (r.highlights as string[]) ?? [],
      address: s(r.address) ?? "",
    };
    return {
      id: s(r.id)!,
      slug: s(r.slug)!,
      name: s(r.name)!,
      tagline: s(r.tagline) ?? "",
      category: r.category as Shop["category"],
      place: { district: r.district as Shop["place"]["district"], tehsil: s(r.tehsil), town: s(r.town) },
      verifications: (r.verifications as Shop["verifications"]) ?? [],
      rating: Number(r.rating ?? 0),
      reviewCount: Number(r.review_count ?? 0),
      productCount: 0,
      followers: Number(r.followers ?? 0),
      tradeMode: r.trade_mode as Shop["tradeMode"],
      delivery: Boolean(r.delivery),
      acceptsOrders: Boolean(r.accepts_orders),
      hours: r.hours as Shop["hours"],
      cover: r.cover_url ? photo(r.cover_url) : (base?.cover ?? photo(null)),
      coverArt: base?.coverArt ?? { seed: 200, palette: "meadow" },
      logo: r.logo_url ? photo(r.logo_url, `${s(r.name)} logo`) : (base?.logo ?? photo(null)),
      monogram: s(r.monogram) || (s(r.name) ?? "RM").slice(0, 2).toUpperCase(),
      bazaar: s(r.bazaar),
      sellerId: s(r.seller_id)!,
    };
  });

  const shopReviews: ShopReview[] = (rev.data as Row[]).map((r) => ({
    id: s(r.id)!,
    shopId: s(r.shop_id)!,
    author: s(r.author)!,
    from: s(r.from_place) ?? "",
    rating: Number(r.rating) as ShopReview["rating"],
    postedAt: s(r.posted_at)!,
    text: s(r.text)!,
    item: s(r.item),
    reply: s(r.reply),
  }));

  const wantedRequests: WantedRequest[] = (wnt.data as Row[]).map((r) => ({
    id: s(r.id)!,
    slug: s(r.slug)!,
    title: s(r.title)!,
    category: r.category as WantedRequest["category"],
    place: { district: r.district as WantedRequest["place"]["district"], town: s(r.town) },
    budget: {
      min: n(r.budget_min),
      max: n(r.budget_max),
      unit: (s(r.unit) as WantedRequest["budget"]["unit"]) ?? undefined,
      negotiable: Boolean(r.negotiable) || undefined,
    },
    mode: r.mode as WantedRequest["mode"],
    quantity: s(r.quantity),
    buyerName: s(r.buyer_name)!,
    buyerType: r.buyer_type as WantedRequest["buyerType"],
    buyerVerified: Boolean(r.buyer_verified),
    postedAt: s(r.posted_at)!,
    offers: Number(r.offers ?? 0),
    details: s(r.details),
    needBy: s(r.need_by),
  }));

  const bazaars: Bazaar[] = (bz.data as Row[]).map((r) => {
    const base = bzMock[s(r.slug)!];
    return {
      slug: s(r.slug)!,
      name: s(r.name)!,
      district: r.district as Bazaar["district"],
      town: s(r.town)!,
      description: s(r.description) ?? "",
      shopCount: Number(r.shop_count ?? 0),
      productCount: Number(r.product_count ?? 0),
      newToday: Number(r.new_today ?? 0),
      art: base?.art ?? { seed: 300, palette: "stone" },
      image: r.image_url ? photo(r.image_url) : (base?.image ?? photo(null)),
      highlights: (r.highlights as string[]) ?? [],
    };
  });

  return { categories, listings, sellers, shops, shopProfiles, shopReviews, wantedRequests, bazaars };
}
