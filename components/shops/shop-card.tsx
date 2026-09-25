import Link from "next/link";
import { BadgeCheck, MapPin, Star, Truck } from "lucide-react";
import type { Shop } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { cn } from "@/lib/utils";

export function ShopLogo({ shop, className }: { shop: Shop; className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border-4 border-paper bg-mint shadow-[0_2px_6px_rgb(0_0_0/0.08)]",
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
    <article className={cn(cardVariants({ variant: "interactive" }), "flex h-full flex-col")}>
      <div className="relative aspect-[16/7] overflow-hidden bg-stone">
        <Photo
          media={shop.cover}
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 45vw, 85vw"
          className="transition-transform duration-700 group-hover:scale-[1.02]"
          fallback={<LandscapeArt art={shop.coverArt} label={shop.cover.alt} />}
        />
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-8 flex items-end justify-between gap-3">
          <ShopLogo shop={shop} />
          {shop.delivery && (
            <Badge tone="delivery" className="mb-1">
              <Truck aria-hidden /> Delivery available
            </Badge>
          )}
        </div>

        <h3 className="heading-card mt-3 flex items-center gap-1.5 text-ink">
          <Link href={routes.shop(shop.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
            {shop.name}
          </Link>
          {verified && <BadgeCheck className="size-[18px] shrink-0 text-success" role="img" aria-label="Verified shop" />}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {town && town !== district ? `${town}, ${district}` : district}
          <span aria-hidden className="mx-1 text-line-strong">·</span>
          {categoryBySlug[shop.category].shortName}
        </p>

        <dl className="mt-4 grid grid-cols-3 divide-x divide-line rounded-md border border-line text-center">
          <div className="px-2 py-2.5">
            <dt className="sr-only">Rating</dt>
            <dd className="flex items-center justify-center gap-1 text-[14px] font-semibold text-ink">
              <Star className="size-3.5 fill-gold text-gold" aria-hidden />
              {shop.rating.toFixed(1)}
            </dd>
            <dd className="text-[11.5px] text-muted">{shop.reviewCount} reviews</dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="sr-only">Products</dt>
            <dd className="text-[14px] font-semibold text-ink">{shop.productCount}</dd>
            <dd className="text-[11.5px] text-muted">products</dd>
          </div>
          <div className="px-2 py-2.5">
            <dt className="sr-only">Followers</dt>
            <dd className="text-[14px] font-semibold text-ink">{formatNumber(shop.followers)}</dd>
            <dd className="text-[11.5px] text-muted">followers</dd>
          </div>
        </dl>

        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={routes.shop(shop.slug)} className={cn(buttonVariants({ variant: "primary", size: "sm" }), "w-full")}>
            View Shop
          </Link>
          <FollowButton shopId={shop.id} shopName={shop.name} className="w-full" />
        </div>
      </div>
    </article>
  );
}
