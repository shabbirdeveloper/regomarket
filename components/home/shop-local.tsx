import Link from "next/link";
import type { Shop } from "@/types";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { ShopCard } from "@/components/shops/shop-card";
import { ArrowRight } from "lucide-react";

export function ShopLocal({ shops }: { shops: Shop[] }) {
  return (
    <section aria-labelledby="shops-title">
      <div className="shell section-y">
        <SectionHeader
          id="shops-title"
          eyebrow="Verified digital storefronts"
          title="Shops on REGOMARKET"
          description="Local businesses you can follow. Some deliver across GB."
          action={{ label: "See all", href: "/shops" }}
        />
        <ul className="rail -mx-4 mt-8 gap-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:gap-6 xl:grid-cols-4">
          {shops.slice(0, 4).map((s) => (
            <li key={s.id} className="w-[84%] shrink-0 xs:w-[76%] sm:w-[55%] md:w-auto">
              <ShopCard shop={s} />
            </li>
          ))}
        </ul>
        <div className="mt-10 hidden justify-center md:flex">
          <Link
            href="/create-shop"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-white px-6 text-[14px] font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
          >
            Have a business? Create your shop
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
        <MobileViewAll href="/shops" label="Explore all shops" />
      </div>
    </section>
  );
}
