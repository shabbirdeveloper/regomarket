import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Star,
  Store,
  Truck,
  UserRound,
} from "lucide-react";
import type { Listing, Seller } from "@/types";
import { getListingBySlug, getListingSlugs, getSellerListings, getSimilarListings } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { formatNumber, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Gallery } from "@/components/listing/gallery";
import { PurchasePanel } from "@/components/listing/purchase-panel";
import { ProductCard } from "@/components/listings/product-card";
import { SaveButton } from "@/components/listings/save-button";
import { cn } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getListingSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getListingBySlug(slug);
  if (!data) return { title: "Ad not found" };
  const { listing } = data;
  const where = districtBySlug[listing.place.district]?.name ?? "Gilgit-Baltistan";
  return {
    title: `${listing.title} in ${where}`,
    description: `Rs ${formatNumber(listing.price.amount)}${listing.price.unit ? ` per ${unitLabel(listing.price.unit)}` : ""} · ${listing.title} for sale in ${where}, Gilgit-Baltistan on REGOMARKET.`,
    alternates: { canonical: routes.listing(slug) },
    openGraph: listing.images[0]?.src ? { images: [{ url: listing.images[0].src, alt: listing.images[0].alt }] } : undefined,
  };
}

const humanize = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
const conditionLabel: Record<string, string> = { new: "New", used: "Used", "like-new": "Like new", refurbished: "Refurbished" };

function specsFor(l: Listing, categoryName: string, where: string) {
  const rows: [string, string][] = [["Category", categoryName]];
  if (l.condition) rows.push(["Condition", conditionLabel[l.condition]]);
  if (l.produce) {
    rows.push(["Grade", l.produce.grade], ["Harvest", String(l.produce.harvestYear)], ["Available", l.produce.quantityAvailable]);
  }
  if (l.livestock) {
    const ls = l.livestock;
    rows.push(["Breed", ls.breed], ["Age", ls.age], ["Gender", ls.gender]);
    if (ls.weightKg) rows.push(["Weight", `About ${ls.weightKg} KG`]);
    if (ls.count && ls.count > 1) rows.push(["Animals", String(ls.count)]);
    rows.push(["Vaccinated", ls.vaccinated ? "Yes" : "No"]);
  }
  for (const [k, v] of Object.entries(l.attributes ?? {})) {
    rows.push([humanize(k), typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)]);
  }
  rows.push(["Location", where], ["Ad ID", l.id.toUpperCase()]);
  return rows;
}

/** Plain, factual description built from the ad's own fields (until sellers write their own). */
function describe(l: Listing, seller: Seller, where: string) {
  const parts: string[] = [];
  if (l.produce) {
    parts.push(
      `${l.produce.grade} grade, from the ${l.produce.harvestYear} harvest. ${l.produce.quantityAvailable} available right now.`,
    );
  }
  if (l.livestock) {
    const ls = l.livestock;
    parts.push(
      `${ls.breed}, ${ls.age.toLowerCase()} old${ls.weightKg ? `, about ${ls.weightKg} KG` : ""}. ${ls.vaccinated ? "Vaccinated, records available on request." : "Not vaccinated yet."}`,
    );
  }
  if (l.attributes) {
    parts.push(
      Object.entries(l.attributes)
        .map(([k, v]) => `${humanize(k)}: ${String(v)}`)
        .join(" · ") + ".",
    );
  }
  parts.push(
    seller.type === "shop"
      ? `Sold by ${seller.name}, a ${seller.verifications.includes("business") ? "verified " : ""}shop in ${where}.`
      : `Listed by ${seller.name} in ${where}. Contact the seller to see it in person.`,
  );
  if (l.price.negotiable) parts.push("The price is negotiable.");
  if (l.wholesale) parts.push("Wholesale quantities available. Ask the seller for bulk rates.");
  return parts;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getListingBySlug(slug);
  if (!data) notFound();
  const { listing, seller, category } = data;

  const district = districtBySlug[listing.place.district]?.name ?? "";
  const where = listing.place.town && listing.place.town !== district ? `${listing.place.town}, ${district}` : district;
  const unit = listing.price.unit ? unitLabel(listing.price.unit) : undefined;
  const isShop = seller.type === "shop";
  const verifiedShop = seller.verifications.includes("business");
  const idVerified = seller.verifications.includes("identity");
  const since = new Date(seller.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  const [fromSeller, similar] = await Promise.all([
    getSellerListings(seller.id, listing.id, 6),
    getSimilarListings(listing, 6),
  ]);
  const specs = specsFor(listing, category.name, `${where}, GB`);
  const about = describe(listing, seller, where);

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href={routes.search({ category: category.slug })} className="hover:text-ink">
                {category.shortName}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li>
              <Link href={routes.search({ district: listing.place.district })} className="hover:text-ink">
                {district}
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="max-w-[40ch] truncate text-ink/80">
              {listing.title}
            </li>
          </ol>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          {/* 1 — Photos */}
          <div className="lg:col-start-1 lg:row-start-1">
            <Gallery images={listing.images} title={listing.title}>
              <div className="absolute right-3 top-3 z-10">
                <SaveButton id={listing.id} title={listing.title} className="size-10" />
              </div>
              {listing.badges.includes("urgent") && (
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-[#c2410c] shadow-sm">
                  Urgent sale
                </span>
              )}
            </Gallery>
          </div>

          {/* 2 — Buy box (sticky on desktop) */}
          <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-[96px]">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={routes.search({ category: category.slug })}
                  className="rounded-full bg-stone px-2.5 py-1 text-[12px] font-medium text-ink/75 hover:bg-line"
                >
                  {category.name}
                </Link>
                {listing.badges.includes("featured") && (
                  <span className="rounded-full bg-gold-wash px-2.5 py-1 text-[12px] font-semibold text-gold-ink">Featured</span>
                )}
                {listing.wholesale && (
                  <span className="rounded-full bg-gold-wash px-2.5 py-1 text-[12px] font-semibold text-gold-ink">Wholesale</span>
                )}
              </div>

              <h1 className="mt-3 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[28px]">
                {listing.title}
              </h1>

              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden /> {where}, GB
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden /> Posted {listing.postedLabel}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" aria-hidden /> {formatNumber(listing.views)} views
                </span>
              </p>

              {/* Seller line */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
                <Link
                  href={isShop && seller.shopSlug ? routes.shop(seller.shopSlug) : `/seller/${seller.id}`}
                  className="group inline-flex min-w-0 items-center gap-2 text-[13.5px]"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-mint text-[11.5px] font-semibold text-mountain">
                    {initials(seller.name)}
                  </span>
                  <span className="text-muted">{isShop ? "Sold by" : "Listed by"}</span>
                  <span className="truncate font-semibold text-ink group-hover:text-mountain">{seller.name}</span>
                  {(verifiedShop || idVerified) && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified" />}
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden />
                </Link>
                {seller.rating ? (
                  <span className="inline-flex items-center gap-1 text-[13px]">
                    <Star className="size-4 fill-gold text-gold" aria-hidden />
                    <span className="font-semibold text-ink">{seller.rating.toFixed(1)}</span>
                    <span className="text-muted">({seller.reviewCount} reviews)</span>
                  </span>
                ) : (
                  <span className="text-[12.5px] text-muted">New seller</span>
                )}
              </div>

              {/* Price */}
              <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="leading-none text-ink">
                  <span className="text-[16px] font-semibold">Rs </span>
                  <span className="text-[34px] font-bold tracking-[-0.03em]">{formatNumber(listing.price.amount)}</span>
                  {unit && <span className="ml-1 text-[15px] font-medium text-muted">/ {unit}</span>}
                </p>
                {listing.price.negotiable && (
                  <span className="rounded-full bg-stone px-2.5 py-0.5 text-[12px] font-medium text-ink/75">Negotiable</span>
                )}
                {listing.condition && (
                  <span className="rounded-full bg-stone px-2.5 py-0.5 text-[12px] font-medium text-ink/75">
                    {conditionLabel[listing.condition]}
                  </span>
                )}
              </div>

              {/* Promise box */}
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-mint px-4 py-3 text-[13px] font-medium text-mountain">
                {listing.orderable ? (
                  <>
                    <li className="inline-flex items-center gap-1.5">
                      <Truck className="size-4" aria-hidden /> Home delivery across GB
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-4" aria-hidden /> Verified shop
                    </li>
                  </>
                ) : (
                  <>
                    <li className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" aria-hidden /> Meet in {where}
                    </li>
                    <li className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-4" aria-hidden /> Inspect before you pay
                    </li>
                    {listing.livestock?.vaccinated && (
                      <li className="inline-flex items-center gap-1.5">
                        <BadgeCheck className="size-4" aria-hidden /> Vaccinated
                      </li>
                    )}
                  </>
                )}
              </ul>

              <div className="mt-6">
                <PurchasePanel
                  slug={listing.slug}
                  item={
                    listing.orderable
                      ? {
                          listingId: listing.id,
                          title: listing.title,
                          image: listing.images[0]?.src ?? null,
                          sellerId: listing.sellerId,
                          shopName: seller.name,
                          shopSlug: seller.shopSlug,
                          shopDistrict: seller.place.district,
                        }
                      : undefined
                  }
                  amount={listing.price.amount}
                  unit={unit}
                  orderable={listing.orderable}
                  phoneMasked={seller.phoneMasked}
                  whatsapp={seller.whatsapp}
                  sellerName={seller.name}
                />
              </div>

              <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                Never send advance payment by Easypaisa, JazzCash or bank to someone you haven&apos;t met.{" "}
                <Link href="/help/safety" className="font-medium text-mountain underline underline-offset-4">
                  Safety tips
                </Link>
              </p>

              {/* Seller card */}
              <section aria-label="About the seller" className="mt-6 rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-mint text-[15px] font-bold text-mountain">
                    {initials(seller.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[15.5px] font-semibold text-ink">
                      {seller.name}
                      {(verifiedShop || idVerified) && <BadgeCheck className="size-[18px] shrink-0 text-success" aria-hidden />}
                    </p>
                    <p className="text-[12.5px] text-muted">
                      {isShop ? "Shop" : "Individual seller"} · Member since {since}
                    </p>
                  </div>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5 text-[12px] font-medium">
                  {seller.verifications.includes("phone") && (
                    <li className="rounded-full bg-mint px-2.5 py-1 text-mountain">Phone verified</li>
                  )}
                  {idVerified && <li className="rounded-full bg-mint px-2.5 py-1 text-mountain">ID verified</li>}
                  {verifiedShop && <li className="rounded-full bg-mint px-2.5 py-1 text-mountain">Verified business</li>}
                </ul>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                  <div>
                    <dd className="text-[15px] font-semibold text-ink">{seller.rating ? seller.rating.toFixed(1) : "—"}</dd>
                    <dt className="text-[11.5px] text-muted">Rating</dt>
                  </div>
                  <div>
                    <dd className="text-[15px] font-semibold text-ink">{seller.deals ? formatNumber(seller.deals) : "—"}</dd>
                    <dt className="text-[11.5px] text-muted">Deals</dt>
                  </div>
                  <div>
                    <dd className="text-[15px] font-semibold text-ink">{seller.responseTime?.replace("within ", "") ?? "—"}</dd>
                    <dt className="text-[11.5px] text-muted">Replies in</dt>
                  </div>
                </dl>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={isShop && seller.shopSlug ? routes.shop(seller.shopSlug) : `/seller/${seller.id}`}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-stone text-[13px] font-semibold text-ink hover:bg-line"
                  >
                    {isShop ? <Store className="size-4" aria-hidden /> : <UserRound className="size-4" aria-hidden />}
                    {isShop ? "Visit shop" : "See profile"}
                  </Link>
                  <Link
                    href={`/messages?listing=${listing.slug}`}
                    className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-stone text-[13px] font-semibold text-ink hover:bg-line"
                  >
                    <MessageSquareText className="size-4" aria-hidden />
                    Message
                  </Link>
                </div>
              </section>
            </div>
          </aside>

          {/* 3 — Details (under photos on desktop, after the buy box on phones) */}
          <div className="lg:col-start-1 lg:row-start-2">
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="text-[19px] font-semibold tracking-[-0.01em] text-ink">
                About this item
              </h2>
              <div className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink/80">
                {about.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>

            <section aria-labelledby="details-title" className="mt-8">
              <h2 id="details-title" className="text-[19px] font-semibold tracking-[-0.01em] text-ink">
                Details
              </h2>
              <dl className="mt-3 grid overflow-hidden rounded-xl border border-line sm:grid-cols-2">
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className={cn(
                      "flex items-baseline justify-between gap-4 border-line px-4 py-3 text-[14px]",
                      i > 0 && "border-t",
                      i === 1 && "sm:border-t-0",
                      i % 2 === 1 && "sm:border-l",
                    )}
                  >
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {fromSeller.length > 0 && (
          <section aria-labelledby="more-seller" className="mt-16">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 id="more-seller" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
                More from {seller.name}
              </h2>
              {isShop && seller.shopSlug && (
                <Link href={routes.shop(seller.shopSlug)} className="text-[14px] font-semibold text-mountain hover:underline">
                  Visit shop
                </Link>
              )}
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-6">
              {fromSeller.map((l) => (
                <li key={l.id}>
                  <ProductCard listing={l} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {similar.length > 0 && (
          <section aria-labelledby="similar" className="mt-16">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 id="similar" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
                Similar ads
              </h2>
              <Link
                href={routes.search({ category: category.slug })}
                className="text-[14px] font-semibold text-mountain hover:underline"
              >
                See all in {category.shortName}
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-6">
              {similar.map((l) => (
                <li key={l.id}>
                  <ProductCard listing={l} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
