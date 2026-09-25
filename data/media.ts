import type { Media } from "@/types";

/**
 * Declares a photo by its path under /public. If the file has not been added
 * yet, lib/media.ts resolves it to `null` and the UI renders a refined
 * generated placeholder instead of a broken image. See IMAGES.md for the
 * full shot list.
 */
export function photo(path: string, alt: string, width = 1600, height = 1200): Media {
  return { src: path, alt, width, height };
}

/**
 * Interim photography from Unsplash (free for commercial use under the
 * Unsplash License). Served through next/image, which resizes and converts to
 * AVIF/WebP. Replace with your own photos over time — see IMAGES.md.
 */
export function unsplash(id: string, alt: string, width = 1600, height = 1200): Media {
  return { src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`, alt, width, height };
}

export const siteImages = {
  hero: unsplash(
    "photo-1684230715186-cb6387f1f09f",
    "Turquoise lake beneath the Karakoram peaks of Gilgit-Baltistan",
    2400,
    1350,
  ),
  bannerDryFruits: photo(
    "/images/banners/dry-apricots.jpg",
    "Golden dried apricots laid out on a rooftop in Hunza",
  ),
  bannerLivestock: photo(
    "/images/banners/goats-alpine-pasture.jpg",
    "A herd of goats grazing on an alpine pasture in Astore",
  ),
  sellStall: photo("/images/ui/sell-stall.png", "", 152, 152),
  createShop: photo("/images/ui/create-shop.png", "", 152, 152),
  bannerShops: photo(
    "/images/banners/skardu-bazaar.jpg",
    "Shopfronts along the main bazaar in Skardu",
  ),
} satisfies Record<string, Media>;
