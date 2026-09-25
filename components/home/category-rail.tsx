import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";
import { CategoryIcon } from "@/components/common/category-icon";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";

/**
 * Neutral, line-icon category navigation. Quiet by default; on hover the
 * border turns green, the icon well turns light green and the title darkens.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="shell pb-4 pt-10 md:pt-14 lg:pt-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 id="categories-title" className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          Browse by category
        </h2>
        <Link href="/categories" className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-mountain hover:text-forest">
          All categories
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <ul className="rail -mx-4 gap-3 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-11 xl:overflow-visible xl:px-0">
        {categories.map((c) => (
          <li key={c.slug} className="w-[112px] shrink-0 xl:w-auto">
            <Link
              href={routes.search({ category: c.slug })}
              className="group flex h-full flex-col items-center gap-3 rounded-lg border border-line bg-paper px-2 pb-4 pt-5 text-center transition-colors duration-200 hover:border-mountain/45"
            >
              <span className="grid size-12 place-items-center rounded-md bg-stone text-mountain transition-colors duration-200 group-hover:bg-mint">
                <CategoryIcon icon={c.icon} size={22} strokeWidth={1.6} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[13.5px] font-medium leading-tight text-ink transition-colors group-hover:text-mountain">
                  {c.shortName}
                </span>
                <span className="tabular text-[12px] text-muted">{formatNumber(c.activeListings)}</span>
              </span>
              <span className="sr-only"> listings</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
