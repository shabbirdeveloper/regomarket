import type { Metadata } from "next";
import { BadgeCheck, ShoppingBag, Users } from "lucide-react";
import { getAccount } from "@/lib/data";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { CreateShopForm } from "@/components/sell/create-shop-form";

export const metadata: Metadata = {
  title: "Create your shop",
  description: "Open a free shop on REGOMARKET: your own page, followers, online orders and a verified badge for GB businesses.",
};

export default async function CreateShopPage() {
  const { me } = await getAccount();
  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Shops", href: "/shops" }, { label: "Create your shop" }]} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[32px]">Create your shop</h1>
            <p className="mt-1 text-[14.5px] text-muted">Bring your GB business online. Free to start.</p>
          </div>
          <ul className="flex flex-wrap gap-2 text-[12.5px] font-medium text-mountain">
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              <Users className="size-4" aria-hidden /> Followers
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              <ShoppingBag className="size-4" aria-hidden /> Online orders
            </li>
            <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              <BadgeCheck className="size-4" aria-hidden /> Verified badge
            </li>
          </ul>
        </div>
        <div className="mt-6">
          <CreateShopForm ownerName={me.name} phone={me.phoneMasked} />
        </div>
      </div>
    </div>
  );
}
