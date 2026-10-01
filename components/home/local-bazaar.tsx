import Link from "next/link";
import type { Bazaar } from "@/types";
import { districtBySlug } from "@/data/locations";
import { routes } from "@/lib/site";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { BazaarCard } from "@/components/bazaar/bazaar-card";
import { cn } from "@/lib/utils";
import { stagger } from "@/components/motion/motion-root";

export function LocalBazaar({ bazaars }: { bazaars: Bazaar[] }) {
  // Busiest market first — it gets the large tile.
  const ordered = [...bazaars].sort((a, b) => b.shopCount - a.shopCount);
  const top = ordered.slice(0, 5); // fills the bento exactly
  const rest = ordered.slice(5);
  return (
    <section aria-labelledby="bazaar-title" className="border-y border-line bg-white">
      <div className="shell section-y">
        <SectionHeader
          id="bazaar-title"
          eyebrow="Only on REGOMARKET"
          title="Bazaars"
          description="A bazaar in every district — browse the shops of Gilgit, Skardu, Aliabad, Chilas and more without leaving home."
          action={{ label: "See all", href: "/bazaar" }}
        />
        {/* Bento on desktop: the busiest market large, four beside it. Swipeable rail on phones. */}
        <ul className="rail -mx-4 mt-10 gap-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:auto-rows-[260px] lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0 xl:auto-rows-[280px]">
          {top.map((b, i) => (
            <li
              key={b.slug}
              data-reveal=""
              style={stagger(i)}
              className={cn(
                "aspect-[4/5] w-[78%] shrink-0 xs:w-[64%] sm:w-[44%] md:w-[34%] lg:aspect-auto lg:w-auto",
                i === 0 && "lg:col-span-2 lg:row-span-2",
              )}
            >
              <BazaarCard bazaar={b} featured={i === 0} />
            </li>
          ))}
        </ul>
        {rest.length > 0 && (
          <nav aria-label="More bazaars" className="mt-8 border-t border-line pt-6">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted">More bazaars</p>
            <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-[14.5px]">
              {rest.map((b, i) => (
                <li key={b.slug} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-line-strong">
                      /
                    </span>
                  )}
                  <Link href={routes.bazaar(b.slug)} className="font-medium text-ink hover:text-mountain hover:underline hover:underline-offset-4">
                    {b.name}
                    <span className="ml-1.5 font-normal text-muted">{districtBySlug[b.district]?.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <MobileViewAll href="/bazaar" label="Explore all bazaars" />
      </div>
    </section>
  );
}
