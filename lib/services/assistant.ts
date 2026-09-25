/**
 * Future REGOMARKET features — interfaces only. Nothing here is implemented or
 * surfaced in the UI yet; components can depend on these contracts so AI and
 * voice features slot in later without rewrites.
 */
import type { CategorySlug, Listing, Place, Price } from "@/types";

export type VoiceLanguage = "ur" | "en" | "balti" | "shina" | "burushaski" | "wakhi";

export interface DraftListing {
  category?: CategorySlug;
  title?: string;
  description?: string;
  price?: Price;
  place?: Place;
  attributes?: Record<string, string | number | boolean>;
}

export interface ListingAssistant {
  /** AI Photo-to-Ad: suggest category, title and attributes from photos */
  draftFromPhotos(imageUrls: string[]): Promise<DraftListing>;
  /** AI description generator */
  writeDescription(draft: DraftListing, language?: VoiceLanguage): Promise<string>;
  /** AI price suggestion based on comparable GB listings */
  suggestPrice(draft: DraftListing): Promise<{ low: number; high: number; basis: number }>;
  /** Voice listing creation (Urdu, Balti, Shina…) */
  draftFromVoice(audio: Blob, language: VoiceLanguage): Promise<DraftListing>;
}

export interface TrustService {
  /** Seller Trust Score (0–100) from verifications, reviews, response rate, tenure */
  trustScore(sellerId: string): Promise<{ score: number; factors: string[] }>;
}

export interface DealService {
  /** REGOMARKET Deal / inspection / local delivery hooks */
  requestInspection(listing: Pick<Listing, "id">, when: string): Promise<{ requestId: string }>;
  quoteDelivery(from: Place, to: Place, weightKg?: number): Promise<{ amount: number; days: number } | null>;
}

/** Feature flags — every future feature ships dark until enabled. */
export const features = {
  aiPhotoToAd: false,
  aiDescriptions: false,
  aiPriceSuggestion: false,
  voiceListing: false,
  trustScore: false,
  regoDeal: false,
  inspection: false,
  localDelivery: false,
} as const;
