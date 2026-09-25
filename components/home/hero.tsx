import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category, District, Media } from "@/types";
import { popularSearches, routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { SearchBar } from "@/components/search/search-bar";
import { MountainMark } from "@/components/common/ornaments";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One strong Gilgit-Baltistan image, a restrained green scrim, one message,
 * two actions. On desktop the search bar straddles the hero's bottom edge;
 * on phones it sits directly under the headline.
 */
export function Hero({
  image,
  categories,
  districts,
}: {
  image: Media;
  categories: Category[];
  districts: District[];
}) {
  return (
    <>
      <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-deep">
        <div className="absolute inset-0 -z-10">
          <Photo
            media={image}
            priority
            sizes="100vw"
            fallback={<LandscapeArt variant="hero" art={{ seed: 7, palette: "alpine", motif: "lake" }} label={image.alt} />}
          />
          {/* Phones: lighter top-to-bottom scrim so the landscape stays visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep/25 via-deep/55 to-deep/90 md:hidden" />
          {/* Tablet & desktop: side scrim behind the copy */}
          <div className="absolute inset-0 hidden bg-deep/35 md:block" />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-deep/80 via-deep/40 to-transparent md:block" />
        </div>

        <div className="shell flex min-h-[400px] flex-col justify-center py-10 md:min-h-[540px] md:pb-24 md:pt-16 lg:min-h-[600px]">
          <div className="max-w-[640px]">
            <p className="mb-5 hidden w-fit items-center gap-2.5 rounded-md border border-white/20 bg-deep/30 px-3 py-1.5 text-[13px] font-medium text-white/90 md:inline-flex">
              <MountainMark className="h-3 w-7 text-gold-soft" />
              Gilgit-Baltistan&apos;s Local Marketplace
            </p>

            <h1 id="hero-title" className="heading-display text-white">
              Buy &amp; Sell Across
              <br />
              <span className="text-gold-soft">Gilgit-Baltistan</span>
            </h1>

            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-white/85 md:mt-5 md:text-[17px]">
              Local products, livestock, shops and everyday goods — directly from people and businesses across GB.
            </p>

            {/* Phones: search first */}
            <SearchBar categories={categories} districts={districts} compact idPrefix="hero-m" className="mt-6 md:hidden" />

            <div className="mt-4 grid grid-cols-2 gap-3 md:mt-8 md:flex md:gap-3">
              <Link href="/search" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "group ring-1 ring-inset ring-white/10")}>
                <span className="md:hidden">Explore</span>
                <span className="hidden md:inline">Explore Marketplace</span>
                <ArrowRight className="hidden transition-transform duration-200 group-hover:translate-x-0.5 md:block" aria-hidden />
              </Link>
              <Link href="/sell" className={buttonVariants({ variant: "light", size: "lg" })}>
                Sell Something
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tablet & desktop: connected search bar overlapping the hero edge */}
      <div className="shell relative z-10 -mt-[31px] hidden md:block">
        <SearchBar categories={categories} districts={districts} idPrefix="hero" className="mx-auto max-w-[1080px]" />
        <p className="mx-auto mt-4 flex max-w-[1080px] flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[13px] text-muted">
          <span className="font-medium text-ink/70">Popular:</span>
          {popularSearches.map((q) => (
            <Link key={q} href={routes.search({ q })} className="hover:text-mountain hover:underline hover:underline-offset-4">
              {q}
            </Link>
          ))}
        </p>
      </div>
    </>
  );
}
