import type { Listing, Seller } from "@/types";
import { unsplash } from "./media";

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/**
 * The signed-in preview user (until Supabase Auth). Everything here is what
 * "Shabbir" would see on his own account pages.
 */
export const me: Seller = {
  id: "u-shabbir",
  type: "individual",
  name: "Shabbir Hussain",
  verifications: ["phone", "identity"],
  memberSince: "2025-05-14",
  place: { district: "gilgit", town: "Jutial" },
  phoneMasked: "0355 •••• 127",
  whatsapp: true,
  responseTime: "within 1 hour",
};

export type MyAdStatus = "active" | "pending" | "sold" | "expired";

/** Shabbir's own ads (public listings + owner-only stats). */
export const myListings: Listing[] = [
  {
    id: "l-3001", slug: "canon-200d-kit-lens-jutial", title: "Canon 200D + 18-55mm Kit Lens",
    category: "cameras-gear", place: { district: "gilgit", town: "Jutial" }, price: { amount: 92_000, negotiable: true },
    images: [unsplash("photo-1495707902641-75cac588d2e9", "Canon DSLR camera with kit lens")],
    badges: [], condition: "used", sellerId: "u-shabbir", postedAt: hoursAgo(20), views: 318,
    attributes: { shutterCount: "12,400", box: "With bag and charger" },
  },
  {
    id: "l-3002", slug: "study-table-and-chair-jutial", title: "Study Table & Chair (Wooden)",
    category: "home", place: { district: "gilgit", town: "Jutial" }, price: { amount: 14_500, negotiable: true },
    images: [unsplash("photo-1593642702821-c8da6771f0c6", "Wooden study table with a laptop")],
    badges: [], condition: "used", sellerId: "u-shabbir", postedAt: hoursAgo(70), views: 142,
  },
  {
    id: "l-3003", slug: "trekking-backpack-50l-jutial", title: "Trekking Backpack 50L",
    category: "cameras-gear", place: { district: "gilgit", town: "Jutial" }, price: { amount: 7_500 },
    images: [unsplash("photo-1622260614153-03223fb72052", "Green trekking backpack on a rock")],
    badges: [], condition: "like-new", sellerId: "u-shabbir", postedAt: hoursAgo(2), views: 12,
  },
];

export const myAdMeta: Record<string, { status: MyAdStatus; chats: number; saves: number }> = {
  "l-3001": { status: "active", chats: 6, saves: 14 },
  "l-3002": { status: "active", chats: 2, saves: 5 },
  "l-3003": { status: "pending", chats: 0, saves: 0 },
};

/* ---------- Messages ---------- */

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  at: string; // ISO
  /** Price offer bubble */
  offer?: number;
}

export interface Conversation {
  id: string;
  /** Who Shabbir is talking to */
  with: { name: string; shopSlug?: string; verified: boolean; online?: boolean };
  /** The ad the chat is about */
  listingSlug: string;
  /** Shabbir is the buyer or the seller in this chat */
  role: "buying" | "selling";
  unread: number;
  messages: ChatMessage[];
}

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export const conversations: Conversation[] = [
  {
    id: "c-1",
    with: { name: "Hunza Dry Fruits House", shopSlug: "hunza-dry-fruits-house", verified: true, online: true },
    listingSlug: "walnut-akhrot-hunza",
    role: "buying",
    unread: 2,
    messages: [
      { id: "m1", from: "me", text: "Assalam o Alaikum, is the walnut still available?", at: minsAgo(95) },
      { id: "m2", from: "them", text: "Walaikum Assalam! Yes, new crop, thin shell. How many KG do you need?", at: minsAgo(80) },
      { id: "m3", from: "me", text: "10 KG for home. Can you deliver to Jutial?", at: minsAgo(62) },
      { id: "m4", from: "them", text: "Yes, delivery to Jutial is Rs 250. It will reach tomorrow.", at: minsAgo(20) },
      { id: "m5", from: "them", text: "Shall I book the order?", at: minsAgo(18) },
    ],
  },
  {
    id: "c-2",
    with: { name: "Imran Ali", verified: true },
    listingSlug: "canon-200d-kit-lens-jutial",
    role: "selling",
    unread: 1,
    messages: [
      { id: "m1", from: "them", text: "Is the Canon 200D still for sale? Shutter count?", at: minsAgo(300) },
      { id: "m2", from: "me", text: "Yes it is. Shutter count is about 12,400.", at: minsAgo(280) },
      { id: "m3", from: "them", text: "My offer", at: minsAgo(45), offer: 85_000 },
    ],
  },
  {
    id: "c-3",
    with: { name: "Karakoram Mobile Zone", shopSlug: "karakoram-mobile-zone", verified: true },
    listingSlug: "iphone-13-128gb-pta-gilgit",
    role: "buying",
    unread: 0,
    messages: [
      { id: "m1", from: "me", text: "What is the battery health of the iPhone 13?", at: minsAgo(60 * 26) },
      { id: "m2", from: "them", text: "89%. PTA approved, with box. You can check it at our Jutial shop.", at: minsAgo(60 * 25) },
      { id: "m3", from: "me", text: "Okay, I'll come in the evening.", at: minsAgo(60 * 24) },
    ],
  },
  {
    id: "c-4",
    with: { name: "Zahra Batool", verified: false },
    listingSlug: "study-table-and-chair-jutial",
    role: "selling",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "Salam, can you share more photos of the table?", at: minsAgo(60 * 50) },
      { id: "m2", from: "me", text: "Sure, I'll send them in the evening.", at: minsAgo(60 * 49) },
    ],
  },
];

/* ---------- Notifications ---------- */

export interface AppNotification {
  id: string;
  kind: "message" | "offer" | "price" | "follow" | "wanted" | "system" | "review";
  title: string;
  body: string;
  href: string;
  at: string;
  read: boolean;
}

export const notifications: AppNotification[] = [
  { id: "n-1", kind: "offer", title: "New offer on your Canon 200D", body: "Imran Ali offered Rs 85,000.", href: "/messages?c=c-2", at: minsAgo(45), read: false },
  { id: "n-2", kind: "message", title: "Hunza Dry Fruits House replied", body: "Shall I book the order?", href: "/messages?c=c-1", at: minsAgo(18), read: false },
  { id: "n-3", kind: "price", title: "Price drop on a saved ad", body: "Organic Walnuts (Shigar) is now Rs 1,500 / KG.", href: "/listing/organic-walnuts-shigar", at: minsAgo(60 * 5), read: true },
  { id: "n-4", kind: "wanted", title: "A buyer wants what you sell", body: "Someone in Skardu is looking for camping gear for 8 people.", href: "/wanted/camping-gear-8-people-skardu", at: minsAgo(60 * 9), read: true },
  { id: "n-5", kind: "follow", title: "New stock at Deosai Outdoor Gear", body: "A shop you follow added a Down Sleeping Bag (−10°C).", href: "/shop/deosai-outdoor-gear", at: minsAgo(60 * 20), read: true },
  { id: "n-6", kind: "system", title: "Your ad is under review", body: "Trekking Backpack 50L will go live within 2 hours.", href: "/dashboard", at: minsAgo(110), read: true },
  { id: "n-7", kind: "review", title: "Rate your deal", body: "How was buying the iPhone 13 from Karakoram Mobile Zone?", href: "/shop/karakoram-mobile-zone#reviews", at: minsAgo(60 * 30), read: true },
];
