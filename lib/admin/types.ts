import type { CategorySlug, DistrictSlug, VerificationLevel } from "@/types";

/* ==========================================================================
   Admin view models. Each one maps 1:1 to a Supabase table (see
   supabase/migrations/20261001000000_admin.sql) so the mock layer in
   lib/admin/data.ts can be replaced with queries without touching the UI.
   ========================================================================== */

export type AdminRole = "owner" | "admin" | "moderator" | "support";

export type ListingStatus = "pending" | "active" | "rejected" | "sold" | "expired" | "removed";
export type ShopStatus = "pending" | "active" | "suspended" | "rejected";
export type UserStatus = "active" | "suspended" | "banned";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type ReportStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type ReviewStatus = "published" | "flagged" | "hidden";
export type WantedStatus = "open" | "closed" | "removed";
export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type InboxStatus = "new" | "replied" | "closed";
export type PostStatus = "published" | "draft";

export interface AdminListing {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  district: DistrictSlug;
  town?: string;
  price: number;
  unit?: string;
  image: string | null;
  sellerId: string;
  sellerName: string;
  sellerVerified: boolean;
  isShop: boolean;
  status: ListingStatus;
  postedAt: string;
  views: number;
  reports: number;
  /** Automatic checks that need a human look */
  flags: string[];
  description?: string;
  reason?: string;
}

export interface AdminShop {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: CategorySlug;
  district: DistrictSlug;
  town?: string;
  logo: string | null;
  monogram: string;
  ownerId: string;
  ownerName: string;
  verifications: VerificationLevel[];
  status: ShopStatus;
  rating: number;
  reviewCount: number;
  followers: number;
  products: number;
  acceptsOrders: boolean;
  delivery: boolean;
  createdAt: string;
  /** Documents sent with a new shop application */
  documents?: string[];
  reason?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  type: "individual" | "shop" | "buyer";
  district: DistrictSlug;
  town?: string;
  verifications: VerificationLevel[];
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  ads: number;
  reports: number;
  deals: number;
  shopSlug?: string;
  reason?: string;
}

export interface AdminVerification {
  id: string;
  userId: string;
  userName: string;
  phone: string;
  district: DistrictSlug;
  level: Extract<VerificationLevel, "identity" | "business">;
  /** What was uploaded — files live in the private `verification` bucket */
  documents: string[];
  businessName?: string;
  status: VerificationStatus;
  submittedAt: string;
  note?: string;
  reason?: string;
}

export interface AdminReport {
  id: string;
  targetKind: "ad" | "user" | "shop" | "review";
  targetId: string;
  targetLabel: string;
  targetHref: string;
  reason: string;
  details?: string;
  reporter: string;
  status: ReportStatus;
  createdAt: string;
  /** How many other people reported the same thing */
  duplicates: number;
  resolution?: string;
}

export interface AdminReview {
  id: string;
  shopId: string;
  shopName: string;
  shopSlug: string;
  author: string;
  from: string;
  rating: number;
  text: string;
  postedAt: string;
  status: ReviewStatus;
  flagReason?: string;
  reply?: string;
}

export interface AdminWanted {
  id: string;
  slug: string;
  title: string;
  category: CategorySlug;
  district: DistrictSlug;
  buyerName: string;
  buyerVerified: boolean;
  budget: string;
  mode: string;
  offers: number;
  status: WantedStatus;
  postedAt: string;
  reason?: string;
}

export interface AdminOrder {
  id: string;
  shopId: string;
  shopName: string;
  listingTitle: string;
  qty: number;
  total: number;
  payment: "cod" | "easypaisa" | "jazzcash" | "bank";
  buyerName: string;
  buyerPhone: string;
  district: DistrictSlug;
  town?: string;
  status: OrderStatus;
  createdAt: string;
  note?: string;
}

export interface AdminInboxMessage {
  id: string;
  name: string;
  reach: string;
  topic: string;
  message: string;
  status: InboxStatus;
  createdAt: string;
  reply?: string;
}

export interface AdminBroadcast {
  id: string;
  title: string;
  body: string;
  audience: "everyone" | "sellers" | "shops" | "buyers";
  district?: DistrictSlug | "all";
  sentAt: string;
  reach: number;
  by: string;
}

export interface AdminCategory {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: string | null;
  ads: number;
  visible: boolean;
  sort: number;
}

export interface AdminBazaar {
  slug: string;
  name: string;
  district: DistrictSlug;
  town: string;
  description: string;
  image: string | null;
  shops: number;
  products: number;
  visible: boolean;
}

export interface AdminDistrict {
  slug: DistrictSlug;
  name: string;
  division: string;
  headquarters: string;
  tehsils: { name: string; towns: number }[];
  ads: number;
}

export interface AdminPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover: string | null;
  date: string;
  readMins: number;
  status: PostStatus;
  author: string;
}

export interface AdminTeamMember {
  id: string;
  name: string;
  phone: string;
  role: AdminRole;
  lastActive: string;
  you?: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  by: string;
  action: string;
  module: string;
  target: string;
  detail?: string;
}

export interface OverviewData {
  kpis: { key: string; label: string; value: number; delta: number; series: number[]; format?: "rs" }[];
  /** Ads posted per day, last 30 days */
  daily: { date: string; ads: number; users: number }[];
  byCategory: { slug: string; name: string; ads: number }[];
  byDistrict: { slug: string; name: string; ads: number }[];
}
