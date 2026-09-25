import Link from "next/link";
import type { Shop } from "@/types";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { ShopCard } from "@/components/shops/shop-card";
import { buttonVariants } from "@/components/ui/button";

export function ShopLocal({ shops }: { shops: Shop[] }) {
  return (
    <section aria-labelledby="shops-title" className="border-y border-line bg-paper">
      <div className="shell section-y">
        <SectionHeader
          id="shops-title"
          eyebrow="Verified digital storefronts"
          title="Local Shops"
          description="Businesses from Aliabad to Khaplu — follow a shop, browse its products, and order directly where delivery is offered."
          action={{ label: "Explore all shops", href: "/shops" }}
        />
        <ul className="rail -mx-4 mt-10 gap-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:gap-6 xl:grid-cols-4">
          {shops.slice(0, 4).map((s) => (
            <li key={s.id} className="w-[84%] shrink-0 xs:w-[76%] sm:w-[55%] md:w-auto">
              <ShopCard shop={s} />
            </li>
          ))}
        </ul>
        <div className="mt-10 hidden justify-center md:flex">
          <Link href="/create-shop" className={buttonVariants({ variant: "secondary" })}>
            Have a business? Create your shop
          </Link>
        </div>
        <MobileViewAll href="/shops" label="Explore all shops" />
      </div>
    </section>
  );
}
