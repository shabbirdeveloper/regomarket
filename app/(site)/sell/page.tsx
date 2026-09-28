import type { Metadata } from "next";
import { getAccount } from "@/lib/data";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { SellForm, type SellInitial } from "@/components/sell/sell-form";

export const metadata: Metadata = {
  title: "Post a free ad",
  description: "Sell anything in Gilgit-Baltistan in 2 minutes: dry fruits, livestock, vehicles, phones, property and more.",
  robots: { index: false },
};

export default async function SellPage({ searchParams }: { searchParams: Promise<{ edit?: string; category?: string }> }) {
  const sp = await searchParams;
  const { me, ads } = await getAccount();
  const ad = sp.edit ? ads.find((a) => a.slug === sp.edit) : undefined;
  const initial: SellInitial | undefined = ad
    ? {
        category: ad.category,
        title: ad.title,
        price: String(ad.price.amount),
        unit: ad.price.unit ?? "",
        negotiable: ad.price.negotiable,
        condition: ad.condition,
        district: ad.place.district,
        town: ad.place.town,
        photos: ad.images.map((m) => m.src).filter(Boolean) as string[],
      }
    : undefined;

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={ad ? [{ label: "My account", href: "/dashboard" }, { label: "Edit ad" }] : [{ label: "Post an ad" }]} />
        <h1 className="mt-4 text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[32px]">{ad ? "Edit your ad" : "Post a free ad"}</h1>
        <p className="mt-1 text-[14.5px] text-muted">{ad ? ad.title : "Five quick steps. Buyers across Gilgit-Baltistan will see it."}</p>
        <div className="mt-6">
          <SellForm key={ad?.id ?? "new"} initial={initial} editing={Boolean(ad)} phone={me.phoneMasked} />
        </div>
      </div>
    </div>
  );
}
