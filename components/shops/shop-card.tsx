import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Star, Truck } from "lucide-react";
import type { Shop } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { cardVariants } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { cn } from "@/lib/utils";

export function ShopLogo({ shop, className }: { shop: Shop; className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-[68px] shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-mint shadow-[0_8px_20px_-10px_rgb(23_33_27/0.45)]",
        className,
      )}
    >
      {shop.logo.src ? (
        <Photo media={shop.logo} sizes="64px" fallback={null} />
      ) : (
        <span aria-hidden className="font-serif text-[20px] font-bold tracking-tight text-mountain">
          {shop.monogram}
        </span>
      )}
    </span>
  );
}

/**
 * Digital storefront card — cover, overlapping logo, verified name, trust
 * numbers and two clear actions. Deliberately different from product cards.
 */
export function ShopCard({ shop }: { shop: Shop }) {
  const verified = shop.verifications.includes("business") || shop.verifications.includes("rego");
  const town = shop.place.town;
  const district = districtBySlug[shop.place.district].name;

  return (
    <article
      className={cn(
        cardVariants({ variant: "plain" }),
        "group flex h-full flex-col rounded-xl transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        "md:hover:-translate-y-1 md:hover:border-gold/40 md:hover:shadow-[0_28px_56px_-30px_rgb(23_33_27/0.45),0_2px_8px_rgb(23_33_27/0.05)]",
        "md:focus-within:-translate-y-1 md:focus-within:border-gold/40",
      )}
    >
      <div className="relative aspect-[16/8] overflow-hidden bg-stone">
        <Photo
          media={shop.cover}
          sizes="(min-width: 1280px) 24vw, (min-width: 768px) 45vw, 85vw"
          className="transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] md:group-hover:scale-[1.06]"
          fallback={<LandscapeArt art={shop.coverArt} label={shop.cover.alt} />}
        />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        {shop.delivery && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-mountain shadow-sm">
            <Truck className="size-3.5" aria-hidden /> Delivers
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-9 flex items-end gap-3">
          <ShopLogo shop={shop} className="transition-transform duration-300 md:group-hover:-translate-y-0.5 md:group-hover:rotate-[-2deg]" />
        </div>

        <h3 className="mt-3 flex items-center gap-1.5 text-[17px] font-semibold tracking-[-0.01em] text-ink transition-colors md:group-hover:text-mountain">
          <Link href={routes.shop(shop.slug)} className="min-w-0 truncate focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
            {shop.name}
          </Link>
          {verified && <BadgeCheck className="size-[18px] shrink-0 text-success" role="img" aria-label="Verified shop" />}
        </h3>
        <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {town && town !== district ? `${town}, ${district}` : district}
          <span aria-hidden className="mx-1 text-line-strong">·</span>
          {categoryBySlug[shop.category].shortName}
        </p>

        {/* Three equal columns: value on top, label under — never wraps awkwardly */}
        <dl className="mt-4 grid grid-cols-3 divide-x divide-line border-y border-line py-3 text-center">
          <div className="flex flex-col-reverse gap-0.5 px-1">
            <dt className="text-[11.5px] text-muted">{shop.reviewCount} reviews</dt>
            <dd className="inline-flex items-center justify-center gap-1 text-[14px] font-semibold text-ink">
              <Star className="size-3.5 fill-gold text-gold" aria-hidden />
              {shop.rating.toFixed(1)}
            </dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5 px-1">
            <dt className="text-[11.5px] text-muted">Products</dt>
            <dd className="text-[14px] font-semibold text-ink">{shop.productCount}</dd>
          </div>
          <div className="flex flex-col-reverse gap-0.5 px-1">
            <dt className="text-[11.5px] text-muted">Followers</dt>
            <dd className="text-[14px] font-semibold text-ink">{formatNumber(shop.followers)}</dd>
          </div>
        </dl>

        <div className="relative z-10 mt-auto flex items-center gap-2 pt-4">
          <Link
            href={routes.shop(shop.slug)}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-stone text-[13px] font-semibold text-ink transition-colors hover:bg-mountain-hover hover:text-white md:group-hover:bg-mountain md:group-hover:text-white"
          >
            View shop
            <ArrowRight className="size-3.5 transition-transform md:group-hover:translate-x-0.5" strokeWidth={2.4} aria-hidden />
          </Link>
          <FollowButton shopId={shop.id} shopName={shop.name} className="h-9 rounded-full px-4" />
        </div>
      </div>
    </article>
  );
}
