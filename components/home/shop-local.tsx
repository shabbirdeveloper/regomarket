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
        {/* Slow ticker like the top banners: pauses on hover / focus; plain swipe row for reduced motion */}
        <div className="group/ticker -mx-4 mt-8 overflow-hidden sm:mx-0 sm:[mask-image:linear-gradient(to_right,transparent,#000_2%,#000_98%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
          <ul className="flex w-max animate-[marquee_70s_linear_infinite] py-2 group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused] motion-reduce:animate-none">
            {[...shops, ...shops].map((s, i) => {
              const copy = i >= shops.length; // second copy only makes the loop seamless
              return (
                <li
                  key={`${s.id}-${i}`}
                  aria-hidden={copy || undefined}
                  inert={copy || undefined}
                  className={copy ? "w-[290px] shrink-0 pr-4 sm:w-[300px] lg:pr-6 motion-reduce:hidden" : "w-[290px] shrink-0 pr-4 sm:w-[300px] lg:pr-6"}
                >
                  <ShopCard shop={s} />
                </li>
              );
            })}
          </ul>
        </div>
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
