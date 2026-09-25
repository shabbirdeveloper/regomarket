import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Bazaar } from "@/types";
import { districtBySlug } from "@/data/locations";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { cardVariants } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * A real GB market, shown as a place: street photograph, restrained
 * bottom-weighted scrim, name + activity, and one action.
 */
export function BazaarCard({ bazaar }: { bazaar: Bazaar }) {
  return (
    <Link
      href={routes.bazaar(bazaar.slug)}
      className={cn(cardVariants({ variant: "media" }), "on-dark flex aspect-[4/5] flex-col justify-end p-5")}
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]">
        <Photo
          media={bazaar.image}
          sizes="(min-width: 1024px) 19vw, (min-width: 640px) 40vw, 68vw"
          fallback={<LandscapeArt art={bazaar.art} label={bazaar.image.alt} />}
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-deep/95 via-deep/60 via-45% to-deep/5" />

      <span className="absolute left-4 top-4 inline-flex h-6 items-center gap-1.5 rounded-xs bg-deep/70 px-2 text-[11.5px] font-medium text-white">
        <span className="size-1.5 rounded-full bg-gold-soft" aria-hidden />
        {bazaar.newToday} new today
      </span>

      <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-white/70">
        {bazaar.town} · {districtBySlug[bazaar.district].name}
      </p>
      <h3 className="mt-1.5 font-serif text-[22px] font-semibold leading-tight">{bazaar.name}</h3>
      <p className="tabular mt-2 text-[13px] text-white/85">
        {bazaar.shopCount} active shops <span aria-hidden className="mx-1 text-white/40">·</span>{" "}
        {formatNumber(bazaar.productCount)} listings
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-gold-soft">
        Explore Bazaar
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10" />
    </Link>
  );
}
