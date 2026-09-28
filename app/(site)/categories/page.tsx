import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategoryOverview } from "@/lib/data";
import { popularSearches, routes } from "@/lib/site";
import { ContentPage } from "@/components/common/content-page";
import { CategoryIcon } from "@/components/common/category-icon";
import { Photo } from "@/components/media/photo";

export const metadata: Metadata = {
  title: "All categories",
  description: "Browse every category on REGOMARKET: dry fruits, livestock, property, vehicles, electronics, handicrafts and more in Gilgit-Baltistan.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const cats = await getCategoryOverview();
  return (
    <ContentPage crumbs={[{ label: "Categories" }]} title="All categories" intro="Everything people buy and sell in Gilgit-Baltistan." wide>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c) => (
          <li key={c.slug}>
            <Link
              href={routes.search({ category: c.slug })}
              className="group flex h-full gap-4 rounded-2xl border border-line p-4 transition-[border-color,box-shadow] hover:border-gold/40 hover:shadow-[0_20px_40px_-28px_rgb(23_33_27/0.45)]"
            >
              <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone">
                {c.image?.src ? (
                  <Photo media={{ ...c.image, alt: "" }} sizes="80px" className="transition-transform duration-500 group-hover:scale-105" fallback={null} />
                ) : (
                  <CategoryIcon icon={c.icon} size={30} className="text-mountain" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-[16px] font-semibold text-ink group-hover:text-mountain">{c.name}</span>
                  <span className="shrink-0 text-[12.5px] text-muted">{c.count} ads</span>
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted">{c.description}</span>
                {c.examples.length > 0 && (
                  <span className="mt-2 block truncate text-[12.5px] text-ink/65">{c.examples.map((e) => e.title).join(" · ")}</span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-2xl bg-cream p-6 md:p-8">
        <h2 className="text-[18px] font-semibold text-ink">Popular in GB right now</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {popularSearches.map((s) => (
            <Link key={s} href={routes.search({ q: s })} className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[13.5px] font-medium text-ink/85 ring-1 ring-line hover:ring-ink/30">
              {s}
            </Link>
          ))}
          <Link href="/search" className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13.5px] font-semibold text-mountain">
            All ads <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
