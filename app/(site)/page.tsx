import type { Metadata } from "next";
import { getBazaars, getCategories, getFeaturedListings, getShops, getWantedRequests } from "@/lib/data";
import { site } from "@/lib/site";
import { websiteLd } from "@/lib/seo";
import { JsonLd } from "@/components/common/json-ld";
import { HomeFeed } from "@/components/home/home-feed";
import { PromoBanners } from "@/components/home/promo-banners";
import { MobileWelcome } from "@/components/home/mobile-welcome";
import { WantedSection } from "@/components/home/wanted-section";
import { ShopLocal } from "@/components/home/shop-local";
import { LocalBazaar } from "@/components/home/local-bazaar";
import { TrustSection } from "@/components/home/trust-section";
import { CreateShopCTA } from "@/components/home/create-shop-cta";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/" },
};

// Re-render at most every 5 minutes so "2h ago" labels and counts stay fresh.
export const revalidate = 300;

/**
 * Homepage = a working marketplace, not a landing page (Temu/Daraz model):
 * announcement bar + header search (in SiteShell) → chip filters → dense
 * product grid. Below the feed: buyer requests, shops, bazaars, safety, sell.
 */
export default async function HomePage() {
  const [categories, listings, shops, wanted, bazaars] = await Promise.all([
    getCategories(),
    getFeaturedListings(200),
    getShops({ limit: 8 }),
    getWantedRequests(6),
    getBazaars(),
  ]);

  return (
    <div className="bg-white">
      <JsonLd data={websiteLd()} />
      <MobileWelcome />
      <PromoBanners />
      <HomeFeed listings={listings} categories={categories} />
      <WantedSection requests={wanted} />
      <ShopLocal shops={shops} />
      <LocalBazaar bazaars={bazaars} />
      <TrustSection />
      <CreateShopCTA />
    </div>
  );
}
