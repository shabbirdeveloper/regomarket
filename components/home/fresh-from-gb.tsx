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
import { cardVariants } from "@/components/ui/card";
import { SaveButton } from "@/components/listings/save-button";
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
          sizes="(min-width: 1280px) 16vw, (min-width: 768px) 30vw, 60vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          fallback={<ProductPlaceholder tint={cat.tint} icon={cat.icon} glyph={glyphFor(listing.title)} label={listing.images[0].alt} />}
        />
        <SaveButton id={listing.id} title={listing.title} className="absolute right-2 top-2 z-10 size-8" />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[16px] font-bold leading-tight text-ink">
          {price.main}
          {price.unit && <span className="ml-1 text-[12px] font-medium text-muted">{price.unit}</span>}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink/85">
          <Link href={routes.listing(listing.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
            {listing.title}
          </Link>
        </h3>
        <p className="mt-auto flex items-center gap-1 pt-2.5 text-[12px] text-muted">
          <MapPin className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {listing.place.town && listing.place.town !== district ? `${listing.place.town}, ${district}` : district}
          </span>
        </p>
        <p className="mt-1 flex items-center gap-1 truncate text-[12px] text-muted">
          <span className="truncate">{listing.seller.type === "shop" ? listing.seller.name : "Local grower"}</span>
          {verified && <BadgeCheck className="size-3.5 shrink-0 text-success" role="img" aria-label="Verified" />}
          {listing.orderable && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 font-medium text-mountain">
              <Truck className="size-3.5" aria-hidden /> Delivers
            </span>
          )}
        </p>
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
    <section aria-labelledby="fresh-title" className="border-y border-line bg-white">
      <div className="shell section-y">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="max-w-2xl">
            <h2 id="fresh-title" className="heading-section text-ink">
              Dry fruits from GB orchards
            </h2>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
              Khubani, akhrot, badam and honey, sold by the families and shops who grow them.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 rounded-md bg-gold-wash px-3 py-1.5 text-[12.5px] font-medium text-gold-ink lg:inline-flex">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden />
              Apricot season: June to August
            </span>
            <Link
              href="/search?category=dry-fruits"
              className="hidden shrink-0 items-center gap-1.5 text-[14px] font-semibold text-mountain underline-offset-4 hover:underline md:inline-flex"
            >
              See all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="rail -mx-4 mt-8 gap-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:gap-4 xl:grid-cols-6">
          {listings.map((l) => (
            <li key={l.id} className="w-[62%] shrink-0 xs:w-[52%] sm:w-[36%] md:w-auto">
              <FreshCard listing={l} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[13px] text-ink/70">
          <span className="font-semibold text-ink">{formatNumber(totalListings)}</span> ads in dry fruits. Buying in bulk
          for a shop or export? <Link href="/wanted/new" className="font-medium text-mountain underline underline-offset-4">Post what you need</Link> and sellers will come to you.
        </p>
      </div>
    </section>
  );
}
