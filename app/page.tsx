import type { Metadata } from "next";
import {
  getBazaars,
  getCategories,
  getDistricts,
  getFeaturedListings,
  getFreshPicks,
  getLivestock,
  getShops,
  getSiteImages,
  getWantedRequests,
} from "@/lib/data";
import { categoryBySlug } from "@/data/categories";
import { site } from "@/lib/site";
import { websiteLd } from "@/lib/seo";
import { JsonLd } from "@/components/common/json-ld";
import { SectionHeader } from "@/components/common/section-header";
import { Hero } from "@/components/home/hero";
import { CategoryRail } from "@/components/home/category-rail";
import { FreshFromGB } from "@/components/home/fresh-from-gb";
import { FeaturedListings } from "@/components/home/featured-listings";
import { ShopLocal } from "@/components/home/shop-local";
import { LivestockMarket } from "@/components/home/livestock-market";
import { WantedSection } from "@/components/home/wanted-section";
import { DistrictExplorer } from "@/components/home/district-explorer";
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
 * Homepage order: Hero + search → Categories → Fresh From GB → Featured →
 * Local Shops → Livestock → Wanted → Districts → Local Bazaar → Trust → Create Shop.
 * Backgrounds alternate cream / warm white so neighbouring sections never blur together.
 */
export default async function HomePage() {
  const [images, categories, districts, fresh, featured, livestock, shops, wanted, bazaars] = await Promise.all([
    getSiteImages(),
    getCategories(),
    getDistricts(),
    getFreshPicks(),
    getFeaturedListings(24),
    getLivestock(),
    getShops({ limit: 8 }),
    getWantedRequests(6),
    getBazaars(),
  ]);

  return (
    <>
      <JsonLd data={websiteLd()} />

      <Hero image={images.hero} categories={categories} districts={districts} />
      <CategoryRail categories={categories} />

      <div className="pt-10 md:pt-12">
        <FreshFromGB listings={fresh} totalListings={categoryBySlug["dry-fruits"].activeListings} />
      </div>

      <section aria-labelledby="featured-title" className="shell section-y">
        <FeaturedListings listings={featured} titleId="featured-title" />
      </section>

      <ShopLocal shops={shops} />

      <section aria-labelledby="livestock-title" className="shell section-y">
        <SectionHeader
          id="livestock-title"
          eyebrow="From herders across GB"
          title="Livestock Market"
          description="Goats, sheep, cows and yaks — with breed, age, weight and vaccination shown up front."
          action={{ label: "View all livestock", href: "/search?category=livestock" }}
        />
        <LivestockMarket listings={livestock} />
      </section>

      <WantedSection requests={wanted} />
      <DistrictExplorer districts={districts} />
      <LocalBazaar bazaars={bazaars} />
      <TrustSection />
      <CreateShopCTA />
    </>
  );
}
