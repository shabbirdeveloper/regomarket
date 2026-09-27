import Link from "next/link";
import { Package, Store } from "lucide-react";
import type { Bazaar } from "@/types";
import { districtBySlug } from "@/data/locations";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * A real GB market shown as a place: the street photograph does the talking.
 * Only a soft bottom fade for legibility, a live "new today" chip, the
 * market's name, what it's known for, and its size. `featured` is the large
 * bento tile with the description.
 */
export function BazaarCard({ bazaar, featured = false }: { bazaar: Bazaar; featured?: boolean }) {
  const district = districtBySlug[bazaar.district].name;
  const where = bazaar.town === district ? district : `${bazaar.town}, ${district}`;

  return (
    <Link
      href={routes.bazaar(bazaar.slug)}
      className={cn(
        "on-dark group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-lg bg-deep text-white",
        featured ? "p-5 lg:p-8" : "p-5",
      )}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]">
        <Photo
          media={bazaar.image}
          sizes={featured ? "(min-width: 1024px) 50vw, 85vw" : "(min-width: 1024px) 25vw, 70vw"}
          fallback={<LandscapeArt art={bazaar.art} label={bazaar.image.alt} />}
        />
      </div>
      {/* Legibility: a soft fade only where the text sits */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#021d16]/90 via-[#021d16]/35 via-45% to-transparent" />
      <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-black/25 to-transparent" />

      {/* Live activity */}
      <span className="glass-pill-dark absolute left-4 top-4 inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-white md:left-5 md:top-5">
        <span className="relative flex size-2" aria-hidden>
          <span className="relative inline-flex size-2 rounded-full bg-[#5ee0a0]" />
        </span>
        {bazaar.newToday} new today
      </span>


      <p className="flex items-center gap-1.5 text-[12px] font-medium text-white/80">
        <span className="h-px w-5 bg-gold-soft" aria-hidden />
        {where}
      </p>
      <h3 className={cn("mt-1.5 font-semibold leading-[1.1] tracking-[-0.02em]", featured ? "text-[21px] lg:text-[36px]" : "text-[21px]")}>
        {bazaar.name}
      </h3>

      {featured && <p className="mt-2.5 hidden max-w-[46ch] text-[14.5px] leading-relaxed text-white/80 lg:block">{bazaar.description}</p>}

      <ul className={cn("mt-3 flex max-h-[26px] flex-wrap gap-1.5 overflow-hidden", featured && "lg:max-h-none")}>
        {bazaar.highlights.slice(0, featured ? 3 : 2).map((h) => (
          <li key={h} className="rounded bg-white/15 px-2 py-0.5 text-[11.5px] font-medium text-white/90">
            {h}
          </li>
        ))}
      </ul>

      <p className={cn("tabular flex items-center gap-4 text-white/85", featured ? "mt-3.5 text-[12.5px] lg:mt-5 lg:text-[13.5px]" : "mt-3.5 text-[12.5px]")}>
        <span className="inline-flex items-center gap-1.5">
          <Store className="size-4 text-gold-soft" strokeWidth={1.8} aria-hidden />
          <span className="font-semibold text-white">{bazaar.shopCount}</span> shops
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Package className="size-4 text-gold-soft" strokeWidth={1.8} aria-hidden />
          <span className="font-semibold text-white">{formatNumber(bazaar.productCount)}</span> listings
        </span>
      </p>

      
    </Link>
  );
}
