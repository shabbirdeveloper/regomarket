import type {
  AdminBroadcast,
  AdminInboxMessage,
  AdminOrder,
  AdminReport,
  AdminTeamMember,
  AdminVerification,
  AuditEntry,
  ListingStatus,
  ReviewStatus,
  UserStatus,
} from "@/lib/admin/types";
import type { Listing, Seller, Shop } from "@/types";
import { unsplash } from "./media";

/**
 * Preview data for the admin panel: things the public site never shows
 * (ads waiting for approval, complaints, orders, contact messages…).
 * Replaced by Supabase rows once admin sign-in uses Supabase Auth.
 */

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => minsAgo(h * 60);
const daysAgo = (d: number) => minsAgo(d * 1440);

/* ---------- Ads waiting for approval ---------- */

export interface PendingListing extends Listing {
  flags: string[];
  description: string;
}

export const pendingListings: PendingListing[] = [
  {
    id: "l-9001", slug: "fresh-apricot-kernels-10kg-hunza", title: "Sweet Apricot Kernels (Badam) 10 KG",
    category: "dry-fruits", place: { district: "hunza", town: "Aliabad" }, price: { amount: 2800, unit: "kg", negotiable: true },
    images: [unsplash("photo-1631815333332-e3ffb24e2bf8", "Apricot kernels in a bowl")], badges: [], sellerId: "u-karim-baig",
    postedAt: minsAgo(18), views: 0, flags: [], description: "Sweet kernels from this year's crop, sun dried. 10 KG available, can deliver in Hunza and Gilgit.",
  },
  {
    id: "l-9002", slug: "iphone-15-pro-max-cheap-gilgit", title: "iPhone 15 Pro Max 256GB — urgent sale",
    category: "electronics", place: { district: "gilgit", town: "Konodas" }, price: { amount: 65_000 },
    images: [unsplash("photo-1695822822491-d92cee704368", "iPhone in box")], badges: [], sellerId: "u-sajjad-hussain",
    postedAt: minsAgo(42), views: 0, flags: ["Price far below market", "Advance payment asked"],
    description: "Brand new, box pack. Send Rs 10,000 advance on Easypaisa and I will courier it. No meeting.",
  },
  {
    id: "l-9003", slug: "desi-cow-with-calf-danyore", title: "Desi Cow with 2-Month Calf",
    category: "livestock", place: { district: "gilgit", town: "Danyore" }, price: { amount: 285_000, negotiable: true },
    images: [unsplash("photo-1618080206739-14e8ac105472", "Cow with calf")], badges: [], sellerId: "u-ayesha-noor",
    postedAt: hoursAgo(1.5), views: 0, flags: [],
    livestock: { animal: "cow", breed: "Desi cross", age: "4 years", gender: "Female", vaccinated: true, count: 2 },
    description: "Healthy cow giving 9–10 litres a day. Calf is 2 months old. Vaccinated, can show the card.",
  },
  {
    id: "l-9004", slug: "plot-2-kanal-sakwar-gilgit", title: "2 Kanal Residential Plot — Sakwar",
    category: "property", place: { district: "gilgit", town: "Sakwar" }, price: { amount: 9_500_000, unit: "kanal", negotiable: true },
    images: [unsplash("photo-1616382120760-54c1f5bab434", "Plot with orchard")], badges: [], sellerId: "u-imran-shah",
    postedAt: hoursAgo(3), views: 0, flags: ["Contact number in description"],
    description: "Clear title, road access, water available. Call 0355-4418318 directly, don't message.",
  },
  {
    id: "l-9005", slug: "toyota-hilux-2016-skardu", title: "Toyota Hilux Vigo 2016 — Skardu Registered",
    category: "vehicles", place: { district: "skardu", town: "Skardu City" }, price: { amount: 5_400_000, negotiable: true },
    images: [unsplash("photo-1610064095022-db1b488c05f1", "4x4 on a mountain road")], badges: [], sellerId: "u-ghulam-abbas",
    postedAt: hoursAgo(5), views: 0, flags: ["Photo also used in another ad"],
    attributes: { year: 2016, mileage: "148,000 km", fuel: "Diesel" },
    description: "Single owner, all documents clear. Tyres new. Serious buyers only.",
  },
  {
    id: "l-9006", slug: "handmade-pattu-shawl-khaplu", title: "Handmade Pattu Shawl — Natural Wool",
    category: "handicrafts", place: { district: "ghanche", town: "Khaplu" }, price: { amount: 18_500 },
    images: [unsplash("photo-1720905412121-eb010cd15955", "Woven shawl")], badges: [], sellerId: "u-muhammad-ali",
    postedAt: hoursAgo(7), views: 0, flags: [],
    description: "Woven by my mother in Hushe. 2.5 metres, natural colour, no dye.",
  },
  {
    id: "l-9007", slug: "honda-cd-70-2022-chilas", title: "Honda CD 70 2022 Model",
    category: "vehicles", place: { district: "diamer", town: "Chilas" }, price: { amount: 138_000, negotiable: true },
    images: [unsplash("photo-1611182150972-4094e06cba79", "Motorcycle")], badges: [], sellerId: "u-shahid-khan",
    postedAt: hoursAgo(11), views: 0, flags: [],
    description: "Genuine condition, 11,000 km. Documents complete, token paid for 2026.",
  },
  {
    id: "l-9008", slug: "seed-potatoes-nagar-50kg", title: "Nagar Seed Potatoes — 50 KG Bags",
    category: "agriculture", place: { district: "nagar", town: "Chalt" }, price: { amount: 5200 },
    images: [unsplash("photo-1623428453655-44feea11454b", "Sacks of potatoes")], badges: [], sellerId: "u-zahid-hussain",
    postedAt: hoursAgo(20), views: 0, flags: [],
    description: "Certified seed potatoes, disease-free. Minimum order 5 bags.",
  },
];

/** Status of ads that already exist on the site (everything else is active). */
export const listingStatusOverrides: Record<string, { status: ListingStatus; reason?: string; reports?: number }> = {
  "l-3003": { status: "pending" },
  "l-2014": { status: "sold" },
  "l-2027": { status: "expired" },
};

/** Report counts by ad id (from the reports table) */
export const listingReports: Record<string, number> = { "l-9002": 3, "l-9005": 1 };

/* ---------- Shop applications ---------- */

export const pendingShops: (Shop & { documents: string[]; ownerName: string; createdAt: string })[] = [
  {
    id: "shop-9001", slug: "rakaposhi-electronics", name: "Rakaposhi Electronics", tagline: "Phones, chargers and repairs in Nagar",
    category: "electronics", place: { district: "nagar", town: "Chalt" }, verifications: ["phone", "identity"],
    rating: 0, reviewCount: 0, productCount: 0, followers: 0, tradeMode: "retail", delivery: false, acceptsOrders: false,
    hours: { open: "10:00", close: "21:00", days: "Mon – Sat" }, cover: { src: null, alt: "" }, coverArt: { seed: 911, palette: "glacier" },
    logo: { src: null, alt: "" }, monogram: "RE", sellerId: "u-zahid-hussain", ownerName: "Zahid Hussain",
    documents: ["CNIC (front & back)", "Shop photo"], createdAt: hoursAgo(6),
  },
  {
    id: "shop-9002", slug: "skardu-carpets-rugs", name: "Skardu Carpets & Rugs", tagline: "Hand-knotted Balti carpets and gabbas",
    category: "handicrafts", place: { district: "skardu", town: "Skardu City" }, verifications: ["phone", "identity"],
    rating: 0, reviewCount: 0, productCount: 0, followers: 0, tradeMode: "both", delivery: true, acceptsOrders: false,
    hours: { open: "09:00", close: "19:00", days: "Mon – Sat" }, cover: { src: null, alt: "" }, coverArt: { seed: 912, palette: "dusk" },
    logo: { src: null, alt: "" }, monogram: "SC", sellerId: "u-ghulam-abbas", ownerName: "Ghulam Abbas",
    documents: ["CNIC (front & back)", "Chamber of Commerce letter", "Shop photo"], createdAt: daysAgo(1.2),
  },
  {
    id: "shop-9003", slug: "gojal-organic-store", name: "Gojal Organic Store", tagline: "Sea buckthorn, apricot oil and local grains",
    category: "dry-fruits", place: { district: "hunza", town: "Gulmit" }, verifications: ["phone"],
    rating: 0, reviewCount: 0, productCount: 0, followers: 0, tradeMode: "retail", delivery: true, acceptsOrders: false,
    hours: { open: "08:30", close: "18:30", days: "Every day" }, cover: { src: null, alt: "" }, coverArt: { seed: 913, palette: "apricot" },
    logo: { src: null, alt: "" }, monogram: "GO", sellerId: "u-karim-baig", ownerName: "Karim Baig",
    documents: ["Shop photo"], createdAt: daysAgo(2.5),
  },
];

export const shopStatusOverrides: Record<string, { status: "suspended"; reason: string }> = {};

/* ---------- Users ---------- */

/** People who only buy (no ads) — they don't appear on the public site. */
export const buyers: Seller[] = [
  { id: "b-nadia-karim", type: "individual", name: "Nadia Karim", verifications: ["phone"], memberSince: "2025-08-02", place: { district: "gilgit", town: "Jutial" }, phoneMasked: "0355 •••• 612" },
  { id: "b-asif-ali", type: "individual", name: "Asif Ali", verifications: ["phone"], memberSince: "2025-11-19", place: { district: "skardu", town: "Skardu City" }, phoneMasked: "0346 •••• 208" },
  { id: "b-raja-traders", type: "individual", name: "Raja Traders", verifications: ["phone", "business"], memberSince: "2025-03-04", place: { district: "skardu", town: "Skardu City" }, phoneMasked: "0355 •••• 900" },
  { id: "b-farhan-baig", type: "individual", name: "Farhan Baig", verifications: ["phone"], memberSince: "2026-01-10", place: { district: "hunza", town: "Karimabad" }, phoneMasked: "0312 •••• 455" },
  { id: "b-sana-hussain", type: "individual", name: "Sana Hussain", verifications: ["phone", "identity"], memberSince: "2025-09-23", place: { district: "gilgit", town: "Danyore" }, phoneMasked: "0355 •••• 377" },
  { id: "b-kamran-shah", type: "individual", name: "Kamran Shah", verifications: ["phone"], memberSince: "2026-06-30", place: { district: "gilgit", town: "Konodas" }, phoneMasked: "0333 •••• 841" },
  { id: "b-quick-cash-99", type: "individual", name: "Quick Cash 99", verifications: [], memberSince: "2026-09-26", place: { district: "gilgit" }, phoneMasked: "0300 •••• 999" },
];

export const userMeta: Record<string, { status?: UserStatus; reason?: string; reports?: number; lastActiveMins: number }> = {
  "u-sajjad-hussain": { reports: 3, lastActiveMins: 40 },
  "b-quick-cash-99": { status: "suspended", reason: "Asking buyers for advance payment", reports: 5, lastActiveMins: 60 * 30 },
  "u-shahid-khan": { lastActiveMins: 60 * 5 },
  "u-shabbir": { lastActiveMins: 1 },
};

/* ---------- Verification requests ---------- */

export const verifications: AdminVerification[] = [
  { id: "v-101", userId: "u-sajjad-hussain", userName: "Sajjad Hussain", phone: "0312 •••• 774", district: "gilgit", level: "identity", documents: ["CNIC front", "CNIC back", "Selfie with CNIC"], status: "pending", submittedAt: minsAgo(25) },
  { id: "v-102", userId: "u-imran-shah", userName: "Imran Shah", phone: "0355 •••• 318", district: "astore", level: "identity", documents: ["CNIC front", "CNIC back", "Selfie with CNIC"], status: "pending", submittedAt: hoursAgo(2) },
  { id: "v-103", userId: "u-ghulam-abbas", userName: "Ghulam Abbas", phone: "0355 •••• 082", district: "skardu", level: "business", businessName: "Skardu Carpets & Rugs", documents: ["Chamber of Commerce letter", "Shop photo", "Utility bill"], status: "pending", submittedAt: hoursAgo(9) },
  { id: "v-104", userId: "u-shahid-khan", userName: "Shahid Khan", phone: "0344 •••• 256", district: "diamer", level: "identity", documents: ["CNIC front", "CNIC back"], status: "pending", submittedAt: daysAgo(1), note: "Selfie missing" },
  { id: "v-105", userId: "s-karakoram-mobile", userName: "Karakoram Mobile Zone", phone: "0311 •••• 649", district: "gilgit", level: "identity", documents: ["CNIC front", "CNIC back", "Selfie with CNIC"], status: "pending", submittedAt: daysAgo(1.6) },
  { id: "v-090", userId: "u-ayesha-noor", userName: "Ayesha Noor", phone: "0355 •••• 941", district: "gilgit", level: "identity", documents: ["CNIC front", "CNIC back", "Selfie with CNIC"], status: "approved", submittedAt: daysAgo(6) },
  { id: "v-088", userId: "b-quick-cash-99", userName: "Quick Cash 99", phone: "0300 •••• 999", district: "gilgit", level: "identity", documents: ["CNIC front"], status: "rejected", submittedAt: daysAgo(2), reason: "Photo edited / name does not match" },
];

/* ---------- Reports ---------- */

export const reports: AdminReport[] = [
  { id: "rp-501", targetKind: "ad", targetId: "l-9002", targetLabel: "iPhone 15 Pro Max 256GB — urgent sale", targetHref: "/admin/listings?q=iPhone%2015%20Pro%20Max", reason: "Scam / asks for advance payment", details: "He told me to send 10,000 on Easypaisa first. Price is too low for a new phone.", reporter: "Nadia Karim", status: "open", createdAt: minsAgo(30), duplicates: 2 },
  { id: "rp-502", targetKind: "user", targetId: "b-quick-cash-99", targetLabel: "Quick Cash 99", targetHref: "/admin/users?q=Quick%20Cash", reason: "Fake account", details: "Messages many sellers saying he will pay double via 'bank transfer' then sends a fake screenshot.", reporter: "Karakoram Mobile Zone", status: "reviewing", createdAt: hoursAgo(4), duplicates: 4 },
  { id: "rp-503", targetKind: "ad", targetId: "l-9005", targetLabel: "Toyota Hilux Vigo 2016 — Skardu Registered", targetHref: "/admin/listings?q=Hilux", reason: "Stolen photos", details: "This is the photo from my jeep ad from last year.", reporter: "Muhammad Ali", status: "open", createdAt: hoursAgo(6), duplicates: 0 },
  { id: "rp-504", targetKind: "shop", targetId: "shop-4", targetLabel: "Karakoram Mobile Zone", targetHref: "/admin/shops?q=Karakoram", reason: "Item not as described", details: "Battery health was 81%, ad said 89%. Shop agreed to return but still waiting.", reporter: "Kamran Shah", status: "open", createdAt: hoursAgo(20), duplicates: 0 },
  { id: "rp-505", targetKind: "review", targetId: "r-9901", targetLabel: "Review on Baltistan Motors", targetHref: "/admin/reviews", reason: "Abusive language", reporter: "Baltistan Motors", status: "open", createdAt: daysAgo(1.1), duplicates: 0 },
  { id: "rp-506", targetKind: "ad", targetId: "l-2031", targetLabel: "Embroidered Table Runner", targetHref: "/admin/listings?q=Table%20Runner", reason: "Wrong category", reporter: "Imran Shah", status: "dismissed", createdAt: daysAgo(3), duplicates: 0, resolution: "Checked: Handicrafts is the right category" },
  { id: "rp-507", targetKind: "ad", targetId: "l-1002", targetLabel: "Premium walnut ad", targetHref: "/admin/listings?q=walnut", reason: "Duplicate ad", reporter: "Asif Ali", status: "dismissed", createdAt: daysAgo(5), duplicates: 0, resolution: "Different sizes, not a duplicate" },
];

/* ---------- Reviews ---------- */

export const extraReviews = [
  { id: "r-9901", shopId: "shop-3", author: "Anonymous buyer", from: "Skardu City, Skardu", rating: 1 as const, postedAt: daysAgo(1.2), text: "Worst showroom, these people are thieves and liars!! Never buy from them ever." },
  { id: "r-9902", shopId: "shop-4", author: "Ali Raza", from: "Jutial, Gilgit", rating: 5 as const, postedAt: hoursAgo(10), text: "Best shop!!! Visit www.cheap-phones-deal.example for more offers" },
];

export const reviewStatus: Record<string, { status: ReviewStatus; flagReason?: string }> = {
  "r-9901": { status: "flagged", flagReason: "Abusive language (reported by shop)" },
  "r-9902": { status: "flagged", flagReason: "Contains a link" },
};

/* ---------- Orders ---------- */

const ORDER_SEED: [string, string, string, number, number, AdminOrder["payment"], string, string, AdminOrder["district"], string, AdminOrder["status"], number][] = [
  ["RM-481220", "shop-1", "Hunza Walnuts (Akhrot) — Thin Shell", 3, 5400, "cod", "Nadia Karim", "0355 •••• 612", "gilgit", "Jutial", "placed", 35],
  ["RM-481187", "shop-2", "Organic Dry Apricot — Premium", 5, 7250, "easypaisa", "Asif Ali", "0346 •••• 208", "skardu", "Skardu City", "placed", 120],
  ["RM-481102", "shop-4", "iPhone 13 128GB PTA", 1, 142_500, "bank", "Farhan Baig", "0312 •••• 455", "hunza", "Karimabad", "confirmed", 60 * 5],
  ["RM-480995", "shop-5", "Wild Hopar Honey 1 KG", 2, 9000, "jazzcash", "Sana Hussain", "0355 •••• 377", "gilgit", "Danyore", "shipped", 60 * 20],
  ["RM-480941", "shop-6", "Hunza Embroidered Cap", 4, 6800, "cod", "Kamran Shah", "0333 •••• 841", "gilgit", "Konodas", "shipped", 60 * 26],
  ["RM-480870", "shop-1", "Dry Fruit Gift Box 1 KG Mix", 3, 10_950, "cod", "Raja Traders", "0355 •••• 900", "skardu", "Skardu City", "delivered", 60 * 50],
  ["RM-480812", "shop-2", "Dried Apricots — Wholesale per Maund", 2, 96_000, "bank", "Raja Traders", "0355 •••• 900", "skardu", "Skardu City", "delivered", 60 * 72],
  ["RM-480790", "shop-4", "Fast Charger 25W", 2, 5000, "cod", "Ayesha Noor", "0355 •••• 941", "gilgit", "Jutial", "cancelled", 60 * 80],
  ["RM-480744", "shop-5", "Sea Buckthorn Juice", 6, 4200, "easypaisa", "Nadia Karim", "0355 •••• 612", "gilgit", "Jutial", "delivered", 60 * 100],
  ["RM-480701", "shop-6", "Pattu Woollen Shawl", 1, 16_500, "cod", "Asif Ali", "0346 •••• 208", "skardu", "Skardu City", "delivered", 60 * 130],
];

export const orders: AdminOrder[] = ORDER_SEED.map(([id, shopId, listingTitle, qty, total, payment, buyerName, buyerPhone, district, town, status, mins]) => ({
  id, shopId, shopName: "", listingTitle, qty, total, payment, buyerName, buyerPhone, district, town, status, createdAt: minsAgo(mins),
}));

/* ---------- Contact form inbox ---------- */

export const inbox: AdminInboxMessage[] = [
  { id: "m-701", name: "Ali Madad", reach: "0355 •••• 520", topic: "Problem with an ad", message: "My ad for a Suzuki Alto is showing 'pending' since yesterday. When will it go live?", status: "new", createdAt: minsAgo(50) },
  { id: "m-702", name: "Hunza Dry Fruits House", reach: "0355 •••• 214", topic: "Shops & business", message: "We want to add a second branch in Gilgit under the same shop. Is it possible?", status: "new", createdAt: hoursAgo(3) },
  { id: "m-703", name: "Saima Noor", reach: "saima.n@example.com", topic: "Safety / scam", message: "Someone called me pretending to be REGOMARKET and asked for my OTP code. Is this you?", status: "new", createdAt: hoursAgo(8) },
  { id: "m-704", name: "Zulfiqar Ali", reach: "0346 •••• 118", topic: "Account & login", message: "I changed my SIM, how can I move my account to the new number?", status: "replied", createdAt: daysAgo(1), reply: "Salam Zulfiqar, please send your old and new number from the Contact page and we'll move it after a quick check." },
  { id: "m-705", name: "Mehdi Abbas", reach: "0355 •••• 604", topic: "Other", message: "Suggestion: please add a category for tourism/guides and jeeps on rent for Deosai.", status: "closed", createdAt: daysAgo(4) },
];

/* ---------- Notifications sent to users ---------- */

export const broadcasts: AdminBroadcast[] = [
  { id: "bc-31", title: "New crop apricots are here", body: "Fresh 2026 crop khubani from Shigar and Hunza — see this week's best prices.", audience: "everyone", district: "all", sentAt: daysAgo(2), reach: 3120, by: "Shabbir Hussain" },
  { id: "bc-30", title: "Stay safe: never share your OTP", body: "REGOMARKET will never call you for your code. Report anyone who asks.", audience: "everyone", district: "all", sentAt: daysAgo(9), reach: 2980, by: "Shabbir Hussain" },
  { id: "bc-29", title: "Verified shops can now take orders", body: "Turn on online orders from your shop settings. Cash on delivery supported.", audience: "shops", district: "all", sentAt: daysAgo(16), reach: 41, by: "Shabbir Hussain" },
];

/* ---------- Admin team ---------- */

export const team: AdminTeamMember[] = [
  { id: "a-1", name: "Shabbir Hussain", phone: "0355 •••• 127", role: "owner", lastActive: minsAgo(1), you: true },
  { id: "a-2", name: "Ayesha Noor", phone: "0355 •••• 941", role: "moderator", lastActive: hoursAgo(3) },
  { id: "a-3", name: "Zahid Hussain", phone: "0346 •••• 460", role: "support", lastActive: daysAgo(1) },
];

/* ---------- Activity log ---------- */

export const auditLog: AuditEntry[] = [
  { id: "au-40", at: minsAgo(12), by: "Ayesha Noor", action: "Approved ad", module: "listings", target: "Organic Walnut Kernels 1 KG" },
  { id: "au-39", at: minsAgo(55), by: "Ayesha Noor", action: "Rejected ad", module: "listings", target: "Used tyres lot", detail: "Photos unclear" },
  { id: "au-38", at: hoursAgo(2), by: "Shabbir Hussain", action: "Verified ID", module: "verifications", target: "Ayesha Noor" },
  { id: "au-37", at: hoursAgo(4), by: "Shabbir Hussain", action: "Suspended user", module: "users", target: "Quick Cash 99", detail: "Asking buyers for advance payment" },
  { id: "au-36", at: hoursAgo(9), by: "Zahid Hussain", action: "Replied to message", module: "inbox", target: "Zulfiqar Ali" },
  { id: "au-35", at: daysAgo(1), by: "Shabbir Hussain", action: "Approved shop", module: "shops", target: "Astore Livestock Traders" },
  { id: "au-34", at: daysAgo(2), by: "Shabbir Hussain", action: "Sent notification", module: "announcements", target: "New crop apricots are here" },
  { id: "au-33", at: daysAgo(3), by: "Ayesha Noor", action: "Dismissed report", module: "reports", target: "Embroidered Table Runner", detail: "Category is correct" },
];
