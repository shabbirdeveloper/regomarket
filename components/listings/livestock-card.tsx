import Link from "next/link";
import { BadgeCheck, MapPin, Phone, Syringe } from "lucide-react";
import type { ListingCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { formatPrice, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { ProductPlaceholder } from "@/components/media/product-placeholder";
import { WhatsAppIcon } from "@/components/common/brand-icons";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { SaveButton } from "./save-button";
import { cn } from "@/lib/utils";

/**
 * Livestock is not a product: the animal's facts come first (breed, age,
 * weight, gender, vaccination), laid out like a record, with contact one tap away.
 * Horizontal on tablet/desktop, stacked on phones.
 */
export function LivestockCard({ listing }: { listing: ListingCardData }) {
  const ls = listing.livestock!;
  const cat = categoryBySlug.livestock;
  const price = formatPrice(listing.price);
  const verified = listing.seller.verifications.some((v) => v !== "phone");
  const specs = [
    { k: "Breed", v: ls.breed },
    { k: "Age", v: ls.age },
    { k: "Weight", v: ls.weightKg ? `~${ls.weightKg} KG` : "—" },
    { k: "Gender", v: ls.count && ls.count > 1 ? `${ls.gender} · ${ls.count} animals` : ls.gender },
  ];
  const contactHref = `${routes.listing(listing.slug)}#contact`;

  return (
    <article className={cn(cardVariants({ variant: "interactive" }), "flex h-full flex-col sm:flex-row")}>
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-stone sm:aspect-auto sm:w-[40%]">
        <Photo
          media={listing.images[0]}
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 90vw"
          className="transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          fallback={<ProductPlaceholder tint={cat.tint} icon="goat" label={listing.images[0].alt} />}
        />
        <SaveButton id={listing.id} title={listing.title} className="absolute right-3 top-3 z-10" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[16px] font-semibold leading-snug text-ink">
              <Link href={routes.listing(listing.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
                {listing.title}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {placeLabel(listing.place, { withTown: true })}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-[18px] font-bold leading-none text-ink">{price.main}</span>
            {price.unit && <span className="text-[12px] text-muted">{price.unit}</span>}
            {listing.price.negotiable && <span className="mt-1 block text-[12px] text-muted">Negotiable</span>}
          </p>
        </div>

        <dl className="mt-4 grid grid-cols-2 border-t border-line">
          {specs.map((s, i) => (
            <div key={s.k} className={cn("border-b border-line py-2.5", i % 2 === 0 ? "pr-3" : "border-l pl-3")}>
              <dt className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-muted">{s.k}</dt>
              <dd className="mt-0.5 truncate text-[14px] font-medium text-ink">{s.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] font-medium">
          <span className={cn("inline-flex items-center gap-1", ls.vaccinated ? "text-success" : "text-muted")}>
            <Syringe className="size-3.5" aria-hidden />
            {ls.vaccinated ? "Vaccinated" : "Not vaccinated"}
          </span>
          <span className={cn("inline-flex items-center gap-1", verified ? "text-success" : "text-muted")}>
            {verified && <BadgeCheck className="size-3.5" aria-hidden />}
            {verified ? "ID-verified seller" : "Phone-verified seller"}
          </span>
        </div>

        <div className="relative z-10 mt-auto grid grid-cols-2 gap-2 pt-5">
          <Link href={contactHref} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full")} aria-label={`Call seller about ${listing.title}`}>
            <Phone aria-hidden /> Call
          </Link>
          <Link href={contactHref} className={cn(buttonVariants({ variant: "whatsapp", size: "sm" }), "w-full")} aria-label={`WhatsApp seller about ${listing.title}`}>
            <WhatsAppIcon size={16} /> WhatsApp
          </Link>
        </div>
      </div>
    </article>
  );
}
