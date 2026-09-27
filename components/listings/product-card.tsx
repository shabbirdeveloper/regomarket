import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageCircle, ShoppingCart, Star, Truck } from "lucide-react";
import type { ListingCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { formatNumber, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { ProductPlaceholder } from "@/components/media/product-placeholder";
import { SaveButton } from "./save-button";
import { cn } from "@/lib/utils";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative size-3">
            <Star className="absolute inset-0 size-3 text-line-strong" fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-3 text-gold" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Dense, shop-style product tile (Temu/Daraz feel): square photo, one-line
 * title, price first, one round action, and the seller's track record.
 * Orderable items get a cart; everything else opens a chat with the seller.
 */
export function ProductCard({ listing, priority = false }: { listing: ListingCardData; priority?: boolean }) {
  const cat = categoryBySlug[listing.category];
  const district = districtBySlug[listing.place.district]?.name ?? "";
  const verified = listing.seller.verifications.some((v) => v !== "phone");
  const { rating, reviewCount, deals } = listing.seller;
  const unit = listing.price.unit ? unitLabel(listing.price.unit) : "";
  const urgent = listing.badges.includes("urgent");

  return (
    <article className="group relative isolate flex min-w-0 flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] md:hover:z-10 md:hover:-translate-y-1 md:focus-within:z-10 md:focus-within:-translate-y-1">
      {/* Hover surface: a white panel with a soft shadow fades in around the tile */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2.5 -z-10 scale-[0.97] rounded-2xl bg-white opacity-0 shadow-[0_28px_56px_-28px_rgb(23_33_27/0.45),0_2px_8px_rgb(23_33_27/0.05)] ring-1 ring-line transition-[opacity,transform] duration-300 ease-out md:group-hover:scale-100 md:group-hover:opacity-100 md:group-focus-within:scale-100 md:group-focus-within:opacity-100"
      />

      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f1ec]">
        <Photo
          media={listing.images[0]}
          priority={priority}
          sizes="(min-width: 1536px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
          className="transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] md:group-hover:scale-[1.07]"
          fallback={<ProductPlaceholder tint={cat.tint} icon={cat.icon} label={listing.images[0].alt} />}
        />
        {urgent && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-[#c2410c] shadow-sm">Urgent</span>
        )}
        {/* Soft fade at the bottom on hover so the action bar reads */}
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" />
        {listing.orderable && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-mountain shadow-sm transition-opacity duration-200 md:group-hover:opacity-0 md:group-focus-within:opacity-0">
            <Truck className="size-3" aria-hidden /> Delivery
          </span>
        )}
        {/* Action bar slides up (decorative — the whole tile is the link) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2.5 bottom-2.5 hidden translate-y-3 items-center justify-center gap-1.5 rounded-full bg-white/95 py-2 text-[12.5px] font-semibold text-ink opacity-0 shadow-[0_8px_20px_-8px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-300 ease-out md:flex md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
        >
          {listing.orderable ? "Quick order" : "View details"}
          <ArrowRight className="size-3.5" strokeWidth={2.4} />
        </span>
        <SaveButton id={listing.id} title={listing.title} className="absolute right-2 top-2 z-10 size-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100" />
      </div>

      <h3 className="mt-2.5 truncate text-[14px] font-medium text-ink transition-colors md:group-hover:text-mountain" title={listing.title}>
        <Link href={routes.listing(listing.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
          {listing.title}
        </Link>
      </h3>

      <div className="mt-1 flex items-center gap-2">
        <p className="min-w-0 truncate leading-none">
          <span className="text-[11.5px] font-semibold text-ink/70">Rs </span>
          <span className="text-[17px] font-bold tracking-[-0.01em] text-ink">{formatNumber(listing.price.amount)}</span>
          {unit && <span className="ml-0.5 text-[11.5px] text-muted">/{unit}</span>}
        </p>
        {listing.wholesale ? (
          <span className="shrink-0 rounded-full bg-gold-wash px-1.5 text-[10.5px] font-semibold leading-[18px] text-gold-ink">Wholesale</span>
        ) : listing.price.negotiable ? (
          <span className="shrink-0 rounded-full bg-stone px-1.5 text-[10.5px] font-medium leading-[18px] text-ink/70">Negotiable</span>
        ) : null}

        <Link
          href={listing.orderable ? `/checkout?listing=${listing.slug}` : `${routes.listing(listing.slug)}#contact`}
          aria-label={listing.orderable ? `Order ${listing.title}` : `Chat with seller about ${listing.title}`}
          className="relative z-10 ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-stone text-ink transition-colors hover:bg-mountain-hover hover:text-white md:group-hover:bg-mountain md:group-hover:text-white"
        >
          {listing.orderable ? (
            <ShoppingCart className="size-[15px]" strokeWidth={2.2} aria-hidden />
          ) : (
            <MessageCircle className="size-[15px]" strokeWidth={2.2} aria-hidden />
          )}
        </Link>
      </div>

      <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12px] text-muted">
        {rating ? (
          <>
            <Stars rating={rating} />
            <span className="tabular font-medium text-ink/80">{rating.toFixed(1)}</span>
            <span className="tabular">({formatNumber(reviewCount ?? 0)})</span>
            {deals ? <span className="truncate">· {formatNumber(deals)} deals</span> : null}
          </>
        ) : (
          <>
            {verified && <BadgeCheck className="size-3.5 shrink-0 text-success" aria-hidden />}
            <span className="truncate">
              {district} · {listing.postedLabel}
            </span>
          </>
        )}
      </p>
      {rating ? (
        <p className={cn("mt-0.5 truncate text-[11.5px] text-muted")}>
          {district} · {listing.postedLabel}
        </p>
      ) : null}
    </article>
  );
}
