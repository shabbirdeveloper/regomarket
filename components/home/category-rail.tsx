import Link from "next/link";
import type { Category } from "@/types";
import { CategoryIcon } from "@/components/common/category-icon";
import { Photo } from "@/components/media/photo";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";

/**
 * Categories as real photo tiles (what you'll actually find inside), with the
 * live ad count. One row of 11 on desktop; a swipeable row on phones.
 */
export function CategoryRail({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="categories-title" className="border-b border-line bg-white">
      <div className="shell py-6 md:py-8">
        <h2 id="categories-title" className="sr-only">
          Browse by category
        </h2>
        <ul className="rail -mx-4 gap-3 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:mx-0 xl:grid xl:grid-cols-11 xl:gap-3 xl:overflow-visible xl:px-0">
          {categories.map((c) => (
            <li key={c.slug} className="w-[88px] shrink-0 sm:w-[100px] xl:w-auto">
              <Link href={routes.search({ category: c.slug })} className="group block text-center outline-offset-4">
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-stone">
                  {c.image?.src ? (
                    <Photo
                      media={c.image}
                      sizes="110px"
                      className="transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      fallback={null}
                    />
                  ) : (
                    <span className="grid size-full place-items-center bg-mint text-mountain">
                      <CategoryIcon icon={c.icon} size={30} strokeWidth={1.6} />
                    </span>
                  )}
                </span>
                <span className="mt-2 block text-[13px] font-semibold leading-tight text-ink group-hover:text-mountain">
                  {c.shortName}
                </span>
                <span className="tabular mt-0.5 block text-[11.5px] text-muted">{formatNumber(c.activeListings)} ads</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
