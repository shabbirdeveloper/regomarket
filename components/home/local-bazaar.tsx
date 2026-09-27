import type { Bazaar } from "@/types";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { BazaarCard } from "@/components/bazaar/bazaar-card";
import { cn } from "@/lib/utils";

export function LocalBazaar({ bazaars }: { bazaars: Bazaar[] }) {
  // Busiest market first — it gets the large tile.
  const ordered = [...bazaars].sort((a, b) => b.shopCount - a.shopCount);
  return (
    <section aria-labelledby="bazaar-title" className="border-y border-line bg-white">
      <div className="shell section-y">
        <SectionHeader
          id="bazaar-title"
          eyebrow="Only on REGOMARKET"
          title="Bazaars"
          description="Browse the shops of Raja Bazaar, Skardu, Aliabad and more without leaving home."
          action={{ label: "See all", href: "/bazaar" }}
        />
        {/* Bento on desktop: the busiest market large, four beside it. Swipeable rail on phones. */}
        <ul className="rail -mx-4 mt-10 gap-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:auto-rows-[260px] lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 xl:auto-rows-[280px]">
          {ordered.map((b, i) => (
            <li
              key={b.slug}
              className={cn(
                "aspect-[4/5] w-[78%] shrink-0 xs:w-[64%] sm:w-[44%] md:w-[34%] lg:aspect-auto lg:w-auto",
                i === 0 && "lg:col-span-2 lg:row-span-2",
              )}
            >
              <BazaarCard bazaar={b} featured={i === 0} />
            </li>
          ))}
        </ul>
        <MobileViewAll href="/bazaar" label="Explore all bazaars" />
      </div>
    </section>
  );
}
