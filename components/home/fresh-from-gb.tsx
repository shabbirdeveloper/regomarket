import Link from "next/link";
import { ArrowRight, BadgeCheck, Cherry, Grape, Hexagon, MapPin, Nut, Truck } from "lucide-react";
import type { ReactNode } from "react";
import type { ListingCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { formatPrice, formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { ProductPlaceholder } from "@/components/media/product-placeholder";
import { Badge } from "@/components/ui/badge";
import { cardVariants } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SaveButton } from "@/components/listings/save-button";
import { MountainMark } from "@/components/common/ornaments";
import { cn } from "@/lib/utils";

/** Placeholder glyph per product until real photos are added */
function glyphFor(title: string): ReactNode | undefined {
  const t = title.toLowerCase();
  const cls = "size-[30px]";
  if (t.includes("walnut") || t.includes("almond")) return <Nut className={cls} strokeWidth={1.25} aria-hidden />;
  if (t.includes("honey")) return <Hexagon className={cls} strokeWidth={1.25} aria-hidden />;
  if (t.includes("mulberr")) return <Grape className={cls} strokeWidth={1.25} aria-hidden />;
  if (t.includes("cherr")) return <Cherry className={cls} strokeWidth={1.25} aria-hidden />;
  return undefined;
}

/** Produce card: origin on the photo, product name in serif, price per KG and seller trust. */
function FreshCard({ listing }: { listing: ListingCardData }) {
  const price = formatPrice(listing.price);
  const cat = categoryBySlug[listing.category];
  const district = districtBySlug[listing.place.district].name;
  const verified = listing.seller.verifications.some((v) => v !== "phone");

  return (
    <article className={cn(cardVariants({ variant: "interactive" }), "flex h-full flex-col")}>
      <div className="relative aspect-[4/3] overflow-hidden bg-stone">
        <Photo
          media={listing.images[0]}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 75vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          fallback={<ProductPlaceholder tint={cat.tint} icon={cat.icon} glyph={glyphFor(listing.title)} label={listing.images[0].alt} />}
        />
        <span className="absolute bottom-3 left-3 inline-flex h-7 items-center gap-1.5 rounded-xs bg-deep/80 px-2.5 text-[12px] font-medium text-white">
          <MapPin className="size-3.5" aria-hidden />
          {listing.place.town && listing.place.town !== district ? `${listing.place.town}, ${district}` : district}
        </span>
        <SaveButton id={listing.id} title={listing.title} className="absolute right-3 top-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="heading-card text-ink">
          <Link href={routes.listing(listing.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
            {listing.title}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-muted">
          {listing.seller.type === "shop" ? listing.seller.name : "Local grower"}
          {verified && (
            <span className="inline-flex items-center gap-0.5 text-success">
              <BadgeCheck className="size-3.5" aria-hidden />
              <span className="font-medium">Verified</span>
            </span>
          )}
        </p>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-5">
          <p className="text-[19px] font-bold leading-none text-ink">
            {price.main}
            {price.unit && <span className="ml-1 text-[13px] font-medium text-muted">{price.unit}</span>}
          </p>
          <div className="flex gap-1.5">
            {listing.orderable && (
              <Badge tone="delivery">
                <Truck aria-hidden /> Delivery
              </Badge>
            )}
            {listing.wholesale && <Badge tone="wholesale">Wholesale</Badge>}
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Signature section — warm oat band, GB produce only. Communicates origin
 * (district on every photo), fair price per KG and who is selling.
 */
export function FreshFromGB({ listings, totalListings }: { listings: ListingCardData[]; totalListings: number }) {
  return (
    <section aria-labelledby="fresh-title" className="relative overflow-hidden bg-oat">
      <div className="shell section-y">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow flex items-center gap-2.5 text-gold-ink">
              <MountainMark className="h-3 w-7" />
              Harvest 2026 · Direct from growers
            </p>
            <h2 id="fresh-title" className="heading-section mt-4 text-ink">
              Fresh From Gilgit-Baltistan
            </h2>
            <p className="lead mt-3 text-ink/75">
              Sun-dried apricots from Shigar, walnuts from Hunza, wild honey from Nagar — sold by the families and
              businesses who grow them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/search?category=dry-fruits&wholesale=true" className={buttonVariants({ variant: "secondary" })}>
              Buy wholesale
            </Link>
            <Link href="/search?category=dry-fruits" className={cn(buttonVariants({ variant: "primary" }), "group")}>
              All local products
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="rail -mx-4 mt-10 gap-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3 lg:gap-6">
          {listings.map((l) => (
            <li key={l.id} className="w-[78%] shrink-0 xs:w-[70%] sm:w-[46%] md:w-auto">
              <FreshCard listing={l} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[13px] text-ink/70">
          <span className="font-semibold text-ink">{formatNumber(totalListings)}</span> local product listings from 11
          districts · Wholesale buyers can post a request in <Link href="/wanted" className="font-medium text-mountain underline underline-offset-4">Wanted</Link>.
        </p>
      </div>
    </section>
  );
}
