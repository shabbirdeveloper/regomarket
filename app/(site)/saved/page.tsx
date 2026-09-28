import type { Metadata } from "next";
import { getAllListingCards, getShops } from "@/lib/data";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SavedView } from "@/components/account/saved-view";

export const metadata: Metadata = { title: "Saved", robots: { index: false } };

export default async function SavedPage() {
  const [listings, shops] = await Promise.all([getAllListingCards(), getShops({ limit: 100 })]);
  return (
    <div className="min-h-[70vh] bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Saved" }]} />
        <h1 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[32px]">Saved</h1>
        <p className="mt-1 text-[14.5px] text-muted">Ads you liked and shops you follow, in one place.</p>
        <div className="mt-6">
          <SavedView listings={listings} shops={shops} />
        </div>
      </div>
    </div>
  );
}
