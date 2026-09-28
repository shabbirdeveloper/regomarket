import type { Metadata } from "next";
import { getListingBySlug } from "@/lib/data";
import { CheckoutView, type SeedItem } from "@/components/checkout/checkout-view";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

/**
 * Checks out the cart. `?buy=<listing id>` checks out just that item (Buy now).
 * Old links `?listing=<slug>&qty=2` still work: the item is put in the cart first.
 */
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ listing?: string; qty?: string; buy?: string }> }) {
  const sp = await searchParams;
  let seed: SeedItem | null = null;
  if (sp.listing) {
    const d = await getListingBySlug(sp.listing);
    if (d?.listing.orderable) {
      seed = {
        listingId: d.listing.id,
        slug: d.listing.slug,
        title: d.listing.title,
        image: d.listing.images[0]?.src ?? null,
        price: d.listing.price.amount,
        unit: d.listing.price.unit,
        sellerId: d.listing.sellerId,
        shopName: d.seller.name,
        shopSlug: d.seller.shopSlug,
        shopDistrict: d.seller.place.district,
        qty: Math.max(1, Math.min(999, Number(sp.qty) || 1)),
      };
    }
  }
  return <CheckoutView buy={sp.buy} seed={seed} />;
}
