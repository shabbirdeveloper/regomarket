/* ==========================================================================
   REGOMARKET domain model
   Shapes mirror the planned Supabase tables so mock data can be swapped for
   real queries without touching components.
   ========================================================================== */

/* ---------- Location (GB only: District → Tehsil → Town/Village) ---------- */

export type DistrictSlug =
  | "gilgit"
  | "skardu"
  | "hunza"
  | "nagar"
  | "shigar"
  | "ghanche"
  | "kharmang"
  | "roundu"
  | "astore"
  | "ghizer"
  | "diamer";

export interface Tehsil {
  slug: string;
  name: string;
  towns: string[];
}

export interface District {
  slug: DistrictSlug;
  name: string;
  /** Administrative headquarters, shown as helper text */
  headquarters: string;
  division: "Gilgit" | "Baltistan" | "Diamer";
  tehsils: Tehsil[];
  activeListings: number;
  /** Seed + palette for the generated landscape used until real photography is added */
  art: ArtSpec;
  image?: Media;
}

export interface Place {
  district: DistrictSlug;
  tehsil?: string;
  town?: string;
}

/* ---------- Media ---------- */

export type ArtPalette = "dawn" | "dusk" | "meadow" | "apricot" | "stone" | "glacier" | "night" | "alpine";

export interface ArtSpec {
  seed: number;
  palette: ArtPalette;
  /** Optional foreground motif for editorial banners */
  motif?: "apricots" | "meadow" | "arches" | "lake" | "terraces";
}

export interface Media {
  /** Local /public path, Cloudinary URL or Supabase URL. `null` → elegant generated placeholder. */
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
}

/* ---------- Categories ---------- */

export type CategorySlug =
  | "dry-fruits"
  | "livestock"
  | "agriculture"
  | "property"
  | "vehicles"
  | "home"
  | "electronics"
  | "cameras-gear"
  | "handicrafts"
  | "machinery"
  | "services";

/** Icon keys resolved to Lucide/custom icons in components/common/CategoryIcon */
export type CategoryIconKey =
  | "apricot"
  | "goat"
  | "wheat"
  | "land"
  | "car"
  | "sofa"
  | "phone"
  | "camera"
  | "tent"
  | "shirt"
  | "tractor"
  | "handshake"
  | "grid";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  icon: CategoryIconKey;
  description: string;
  activeListings: number;
  /** Warm tint used by product placeholders */
  tint: string;
  /** Illustrated icon shown in the category row */
  image?: Media;
}

/* ---------- Trust ---------- */

export type VerificationLevel = "phone" | "identity" | "business" | "rego";

/* ---------- Sellers & shops ---------- */

export type SellerType = "individual" | "shop";

export interface Seller {
  id: string;
  type: SellerType;
  name: string;
  /** shop slug when type === "shop" */
  shopSlug?: string;
  verifications: VerificationLevel[];
  memberSince: string; // ISO date
  place: Place;
  /** Masked for display; full number revealed on tap in later screens */
  phoneMasked: string;
  whatsapp?: boolean;
  rating?: number;
  reviewCount?: number;
  responseTime?: string;
  /** Verified shops that take orders directly on REGOMARKET (checkout + delivery) */
  acceptsOrders?: boolean;
  /** Shop delivers locally */
  delivery?: boolean;
  /** Completed deals — shown as a trust signal */
  deals?: number;
}

export type TradeMode = "retail" | "wholesale" | "both";

export interface OpeningHours {
  open: string; // "09:00"
  close: string; // "20:00"
  days: string; // "Mon – Sat"
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  place: Place;
  verifications: VerificationLevel[];
  rating: number;
  reviewCount: number;
  productCount: number;
  followers: number;
  tradeMode: TradeMode;
  delivery: boolean;
  /** Direct ordering enabled (checkout); only verified shops */
  acceptsOrders: boolean;
  hours: OpeningHours;
  cover: Media;
  coverArt: ArtSpec;
  logo: Media;
  /** Two-letter monogram used when no logo has been uploaded */
  monogram: string;
  bazaar?: string;
  sellerId: string;
}

/* ---------- Listings ---------- */

export type PriceUnit = "kg" | "maund" | "piece" | "month" | "day" | "litre" | "dozen" | "kanal" | "bottle";

export interface Price {
  amount: number;
  unit?: PriceUnit;
  negotiable?: boolean;
}

export type ListingBadge = "featured" | "verified" | "urgent" | "wholesale";

export type Condition = "new" | "used" | "like-new" | "refurbished";

export type LivestockAnimal = "goat" | "sheep" | "cow" | "yak" | "poultry" | "other";

export interface LivestockDetails {
  animal: LivestockAnimal;
  breed: string;
  age: string;
  gender: "Male" | "Female" | "Mixed";
  weightKg?: number;
  vaccinated: boolean;
  count?: number;
}

export interface ProduceDetails {
  grade: "Premium" | "A Grade" | "Standard";
  harvestYear: number;
  quantityAvailable: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  place: Place;
  price: Price;
  images: Media[];
  badges: ListingBadge[];
  /** Short metadata pill: "Wholesale", "Negotiable", "Used"… */
  tag?: string;
  condition?: Condition;
  wholesale?: boolean;
  delivery?: boolean;
  sellerId: string;
  postedAt: string; // ISO
  views: number;
  livestock?: LivestockDetails;
  produce?: ProduceDetails;
  /** Free-form attributes for category-specific fields (vehicle year, property area…) */
  attributes?: Record<string, string | number | boolean>;
}

/** Listing joined with its seller — what cards render. */
export interface ListingCardData extends Listing {
  seller: Pick<Seller, "id" | "type" | "name" | "shopSlug" | "verifications" | "delivery">;
  postedLabel: string;
  /** True only when the seller is a shop with ordering enabled and the item can be shipped */
  orderable: boolean;
}

/* ---------- Local products (Fresh From GB) ---------- */

export interface LocalProduct {
  slug: string;
  name: string;
  localName?: string;
  fromPrice: Price;
  wholesale: boolean;
  listings: number;
  origin: string;
  image: Media;
  tint: string;
}

/* ---------- Wanted (reverse marketplace) ---------- */

export interface WantedRequest {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  place: Place;
  budget: { min?: number; max?: number; unit?: PriceUnit; negotiable?: boolean };
  mode: "Wholesale" | "Retail" | "Bulk" | "Rent";
  quantity?: string;
  buyerName: string;
  buyerType: "Business" | "Individual";
  buyerVerified: boolean;
  postedAt: string;
  offers: number;
}

export interface WantedCardData extends WantedRequest {
  postedLabel: string;
}

/* ---------- Local Bazaar ---------- */

export interface Bazaar {
  slug: string;
  name: string;
  district: DistrictSlug;
  town: string;
  description: string;
  shopCount: number;
  productCount: number;
  newToday: number;
  art: ArtSpec;
  image: Media;
  highlights: string[];
}

/* ---------- Search ---------- */

export type SortKey = "newest" | "price-asc" | "price-desc" | "popular";

export interface SearchParams {
  q?: string;
  category?: CategorySlug;
  district?: DistrictSlug;
  town?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  verified?: boolean;
  wholesale?: boolean;
  retail?: boolean;
  delivery?: boolean;
  sort?: SortKey;
  page?: number;
}
