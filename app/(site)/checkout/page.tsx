import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquareText, ShoppingBag } from "lucide-react";
import { getAccount, getListingBySlug } from "@/lib/data";
import { routes } from "@/lib/site";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ listing?: string; qty?: string }> }) {
  const sp = await searchParams;
  const [data, { me }] = await Promise.all([sp.listing ? getListingBySlug(sp.listing) : null, getAccount()]);

  // Nothing to buy, or an item that isn't sold online
  if (!data || !data.listing.orderable) {
    return (
      <div className="min-h-[60vh] bg-cream">
        <div className="shell py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
              <ShoppingBag className="size-6" aria-hidden />
            </span>
            <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-ink">
              {data ? "This item isn't sold online" : "Nothing to check out"}
            </h1>
            <p className="mt-2 text-[14.5px] text-muted">
              {data
                ? "Livestock, property, vehicles and items from individual sellers are bought in person. Chat with the seller to agree and meet."
                : "Pick an item with the “Delivery” tag and tap Order now."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {data ? (
                <Link href={`/messages?listing=${data.listing.slug}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
                  <MessageSquareText className="size-4" aria-hidden /> Chat with seller
                </Link>
              ) : (
                <Link href="/search?delivery=1" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
                  See items with delivery
                </Link>
              )}
              {data && (
                <Link href={routes.listing(data.listing.slug)} className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink">
                  Back to the ad
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { listing, seller } = data;
  const qty = Number(sp.qty) || 1;

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: listing.title, href: routes.listing(listing.slug) }, { label: "Checkout" }]} />
        <h1 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Checkout</h1>
        <div className="mt-6">
          <CheckoutForm
            listing={listing}
            shop={{
              name: seller.name,
              slug: seller.shopSlug,
              district: seller.place.district,
              town: seller.place.town,
              verified: seller.verifications.includes("business") || seller.verifications.includes("rego"),
            }}
            initialQty={qty}
            buyer={{ name: me.name, phone: "", district: me.place.district, town: me.place.town }}
          />
        </div>
      </div>
    </div>
  );
}
