import Link from "next/link";
import { BadgeCheck, MapPin, Package, Truck } from "lucide-react";
import type { ListingCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { formatPrice, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { ProductPlaceholder } from "@/components/media/product-placeholder";
import { cardVariants } from "@/components/ui/card";
import { ListingBadge, primaryBadge } from "./listing-badge";
import { SaveButton } from "./save-button";
import { cn } from "@/lib/utils";

/**
 * Standard listing card — photo first, then title, location and price.
 * At most one badge on the photo and one line of metadata. "Order now"
 * appears only for verified shops with ordering enabled; everything else is
 * a classified you contact the seller about.
 */
export function ListingCard({
  listing,
  priority,
  className,
}: {
  listing: ListingCardData;
  priority?: boolean;
  className?: string;
}) {
  const cat = categoryBySlug[listing.category];
  const price = formatPrice(listing.price);
  const badge = primaryBadge(listing.badges);
  const isShop = listing.seller.type === "shop";
  const sellerVerified = listing.seller.verifications.some((v) => v !== "phone");

  // One quiet metadata line, most useful first
  const meta = listing.orderable
    ? { Icon: Truck, text: "Delivery available", cls: "text-mountain" }
    : listing.wholesale && badge !== "wholesale"
      ? { Icon: Package, text: "Wholesale available", cls: "text-ink/70" }
      : listing.price.negotiable
        ? { Icon: null, text: "Negotiable", cls: "text-ink/70" }
        : listing.condition === "used" || listing.condition === "like-new"
          ? { Icon: null, text: listing.condition === "used" ? "Used" : "Like new", cls: "text-ink/70" }
          : null;

  return (
    <article className={cn(cardVariants({ variant: "interactive" }), "flex h-full flex-col", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <Photo
          media={listing.images[0]}
          priority={priority}
          sizes="(min-width: 1024px) 24vw, (min-width: 768px) 32vw, 50vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          fallback={<ProductPlaceholder tint={cat.tint} icon={cat.icon} label={listing.images[0].alt} />}
        />
        {badge && <ListingBadge badge={badge} className="absolute left-3 top-3" />}
        <SaveButton id={listing.id} title={listing.title} className="absolute right-3 top-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink [text-wrap:wrap]">
          <Link href={routes.listing(listing.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
            {listing.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{placeLabel(listing.place)}</span>
        </p>

        <p className="mt-3 text-[18px] font-bold leading-none tracking-[-0.01em] text-ink">
          {price.main}
          {price.unit && <span className="ml-1 text-[13px] font-medium text-muted">{price.unit}</span>}
        </p>

        {meta && (
          <p className={cn("mt-2 flex items-center gap-1.5 text-[12.5px] font-medium", meta.cls)}>
            {meta.Icon && <meta.Icon className="size-3.5" aria-hidden />}
            {meta.text}
          </p>
        )}

        <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="flex min-w-0 items-center gap-1 text-[12px] text-muted">
            <span className="truncate">{isShop ? listing.seller.name : "Individual seller"}</span>
            {sellerVerified && <BadgeCheck className="size-3.5 shrink-0 text-success" role="img" aria-label="Verified seller" />}
          </span>
          {listing.orderable ? (
            <Link
              href={`/checkout?listing=${listing.slug}`}
              className="relative z-10 -my-1 -mr-2 shrink-0 rounded-sm px-2 py-1 text-[12.5px] font-semibold text-mountain hover:bg-mint"
            >
              Order now
            </Link>
          ) : (
            <span className="hidden shrink-0 text-[12px] text-muted sm:inline">{listing.postedLabel}</span>
          )}
        </div>
        </div>
      </div>
    </article>
  );
}
