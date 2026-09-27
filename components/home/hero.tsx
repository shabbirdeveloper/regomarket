import Link from "next/link";
import type { Category, District, Media } from "@/types";
import { popularSearches, routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { SearchBar } from "@/components/search/search-bar";

export interface HeroStats {
  listings: string;
  shops: string;
  districts: number;
}

/**
 * Compact, content-first hero. One real sentence, one search, and the
 * listings start right below — like a working marketplace, not a landing page.
 */
export function Hero({
  image,
  categories,
  districts,
  stats,
}: {
  image: Media;
  categories: Category[];
  districts: District[];
  stats: HeroStats;
}) {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-deep">
      <div className="absolute inset-0 -z-10">
        <Photo
          media={image}
          priority
          sizes="100vw"
          className="object-[center_45%]"
          fallback={<LandscapeArt variant="hero" art={{ seed: 7, palette: "alpine", motif: "lake" }} label={image.alt} />}
        />
        <div className="absolute inset-0 bg-[#0c1a14]/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a14]/70 via-[#0c1a14]/25 to-transparent" />
      </div>

      <div className="shell py-10 md:py-16 lg:py-20">
        <div className="max-w-[720px]">
          <h1 id="hero-title" className="text-[30px] font-bold leading-[1.12] tracking-[-0.025em] text-white md:text-[44px] lg:text-[50px]">
            Buy and sell anything in Gilgit-Baltistan
          </h1>
          <p className="mt-3 text-[15px] text-white/85 md:text-[17px]">
            <span className="font-semibold text-white">{stats.listings} ads</span> from Gilgit, Skardu, Hunza and{" "}
            {stats.districts - 3} more districts. Posting is free.
          </p>
        </div>

        <div className="mt-7 max-w-[1040px] md:mt-9">
          <SearchBar categories={categories} districts={districts} compact idPrefix="hero-m" className="md:hidden" />
          <SearchBar categories={categories} districts={districts} idPrefix="hero" className="hidden md:flex" />

          <p className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 text-[13.5px] text-white/80">
            <span className="mr-1.5 text-white/60">Popular:</span>
            {popularSearches.map((q, i) => (
              <span key={q} className="inline-flex items-center">
                <Link href={routes.search({ q })} className="text-white/90 underline-offset-4 hover:text-white hover:underline">
                  {q}
                </Link>
                {i < popularSearches.length - 1 && (
                  <span aria-hidden className="mx-2 text-white/35">
                    ·
                  </span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
