import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Landmark,
  MapPin,
  MessageSquareText,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Star,
  Store,
  Truck,
  UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ShopProfile } from "@/types";
import { getShopBySlug, getShopSlugs, getSimilarShops } from "@/lib/data";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { bazaars } from "@/data/bazaars";
import { formatHour, formatNumber } from "@/lib/format";
import { routes, site } from "@/lib/site";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { JsonLd } from "@/components/common/json-ld";
import { WhatsAppIcon } from "@/components/common/brand-icons";
import { FollowButton } from "@/components/shops/follow-button";
import { ShopCard, ShopLogo } from "@/components/shops/shop-card";
import { OpenStatus } from "@/components/shop/open-status";
import { ShareButton } from "@/components/shop/share-button";
import { ShopTabs } from "@/components/shop/shop-tabs";
import { ShopProducts } from "@/components/shop/shop-products";
import { ShopReviews } from "@/components/shop/shop-reviews";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getShopSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getShopBySlug(slug);
  if (!data) return { title: "Shop not found" };
  const { shop } = data;
  const where = districtBySlug[shop.place.district]?.name ?? "Gilgit-Baltistan";
  return {
    title: `${shop.name} · ${where}`,
    description: `${shop.tagline}. ${shop.productCount} products, rated ${shop.rating.toFixed(1)} by ${shop.reviewCount} buyers. Shop on REGOMARKET.`,
    alternates: { canonical: routes.shop(slug) },
    openGraph: shop.cover.src ? { images: [{ url: shop.cover.src, alt: shop.name }] } : undefined,
  };
}

const PAY_ICON: Record<ShopProfile["payments"][number], LucideIcon> = {
  "Cash on delivery": Banknote,
  "Cash at shop": Banknote,
  Easypaisa: Smartphone,
  JazzCash: Smartphone,
  "Bank transfer": Landmark,
};

const TRADE = { retail: "Retail", wholesale: "Wholesale", both: "Retail & wholesale" } as const;

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getShopBySlug(slug);
  if (!data) notFound();
  const { shop, seller, profile, products, reviews } = data;
  const similar = await getSimilarShops(shop, 4);

  const district = districtBySlug[shop.place.district]?.name ?? "";
  const town = shop.place.town && shop.place.town !== district ? shop.place.town : undefined;
  const where = town ? `${town}, ${district}` : district;
  const category = categoryBySlug[shop.category];
  const bazaar = shop.bazaar ? bazaars.find((b) => b.slug === shop.bazaar) : undefined;
  const v = shop.verifications;
  const verified = v.includes("business") || v.includes("rego");
  const since = new Date(seller.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.name}, ${profile.address}`)}`;

  const trust: { Icon: LucideIcon; label: string }[] = [
    ...(v.includes("rego") ? [{ Icon: ShieldCheck, label: "REGOMARKET verified" }] : []),
    ...(v.includes("business") ? [{ Icon: Building2, label: "Verified business" }] : []),
    ...(v.includes("identity") ? [{ Icon: UserRoundCheck, label: "Owner ID checked" }] : []),
    ...(shop.delivery ? [{ Icon: Truck, label: "Delivers across GB" }] : [{ Icon: Store, label: "Visit the shop" }]),
    ...(shop.acceptsOrders ? [{ Icon: ShoppingBag, label: "Order online" }] : []),
    { Icon: Package, label: TRADE[shop.tradeMode] },
  ];

  const stats: { value: string; label: string; star?: boolean }[] = [
    { value: shop.rating.toFixed(1), label: `${formatNumber(shop.reviewCount)} reviews`, star: true },
    { value: String(shop.productCount), label: "Products" },
    { value: formatNumber(shop.followers), label: "Followers" },
    { value: seller.deals ? formatNumber(seller.deals) : "—", label: "Deals done" },
    { value: seller.responseTime?.replace("within ", "") ?? "Same day", label: "Replies in" },
    { value: String(profile.founded), label: "In business since" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: shop.name,
    description: shop.tagline,
    url: `${site.url}${routes.shop(shop.slug)}`,
    image: shop.cover.src ?? undefined,
    address: { "@type": "PostalAddress", streetAddress: profile.address, addressLocality: town ?? district, addressRegion: "Gilgit-Baltistan", addressCountry: "PK" },
    openingHours: `${shop.hours.days.replace(/\s/g, "")} ${shop.hours.open}-${shop.hours.close}`,
    aggregateRating: { "@type": "AggregateRating", ratingValue: shop.rating, reviewCount: shop.reviewCount },
  };

  /* ---------- About panel ---------- */
  const about = (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">About {shop.name}</h2>
        <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/80">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {profile.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2.5 rounded-xl bg-cream px-4 py-3 text-[13.5px] font-medium text-ink">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mountain text-white">
                <Check className="size-3.5" strokeWidth={3} aria-hidden />
              </span>
              {h}
            </li>
          ))}
        </ul>

        <h3 className="mt-10 text-[17px] font-semibold text-ink">Delivery & payment</h3>
        <div className="mt-3 rounded-2xl border border-line">
          <div className="flex items-start gap-3 border-b border-line p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint text-mountain">
              {shop.delivery ? <Truck className="size-5" aria-hidden /> : <Store className="size-5" aria-hidden />}
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-ink">{shop.delivery ? "Home delivery" : "Pickup at the shop"}</p>
              <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted">{profile.deliveryNote}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-mint text-mountain">
              <CreditCard className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold text-ink">Ways to pay</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {profile.payments.map((p) => {
                  const Icon = PAY_ICON[p];
                  return (
                    <li key={p} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone px-3 text-[12.5px] font-medium text-ink/85">
                      <Icon className="size-3.5 text-muted" aria-hidden />
                      {p}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          Pay only after you receive or see the item. Report a shop from any of its ads if something feels wrong.
        </p>
      </div>

      {/* Info card */}
      <aside className="h-fit rounded-2xl border border-line">
        <div className="p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <Clock className="size-[18px] text-muted" aria-hidden /> Opening hours
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[14px]">
            <span className="text-ink/80">{shop.hours.days}</span>
            <span className="font-semibold text-ink">
              {formatHour(shop.hours.open)} – {formatHour(shop.hours.close)}
            </span>
          </div>
          <OpenStatus hours={shop.hours} className="mt-3" />
        </div>

        <div className="border-t border-line p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <MapPin className="size-[18px] text-muted" aria-hidden /> Address
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{profile.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone px-3.5 text-[13px] font-semibold text-ink hover:bg-line"
            >
              Open in Maps <ExternalLink className="size-3.5" aria-hidden />
            </a>
            {bazaar && (
              <Link
                href={routes.bazaar(bazaar.slug)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-stone px-3.5 text-[13px] font-semibold text-ink hover:bg-line"
              >
                <Store className="size-3.5" aria-hidden /> {bazaar.name}
              </Link>
            )}
          </div>
        </div>

        <div className="border-t border-line p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <Phone className="size-[18px] text-muted" aria-hidden /> Contact
          </p>
          <p className="mt-2 text-[15px] font-semibold tracking-wide text-ink">{seller.phoneMasked}</p>
          <p className="text-[12.5px] text-muted">
            <Link href={`/login?next=${encodeURIComponent(routes.shop(shop.slug))}`} className="font-medium text-mountain underline underline-offset-4">
              Sign in
            </Link>{" "}
            to see the full number.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href={`/messages?shop=${shop.slug}`}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-mountain text-[13.5px] font-semibold text-white hover:bg-mountain-hover"
            >
              <MessageSquareText className="size-4" aria-hidden /> Message
            </Link>
            {seller.whatsapp ? (
              <Link
                href={`/messages?shop=${shop.slug}&via=whatsapp`}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#1f7a52] text-[13.5px] font-semibold text-white hover:bg-[#186643]"
              >
                <WhatsAppIcon size={16} /> WhatsApp
              </Link>
            ) : null}
          </div>
        </div>

        <div className="border-t border-line p-5">
          <p className="flex items-center gap-2 text-[14.5px] font-semibold text-ink">
            <BadgeCheck className="size-[18px] text-muted" aria-hidden /> Checks we did
          </p>
          <ul className="mt-3 space-y-2 text-[13.5px] text-ink/80">
            {[
              ["Phone number", v.includes("phone")],
              ["Owner's CNIC", v.includes("identity")],
              ["Business documents", v.includes("business")],
              ["Shop visit by REGOMARKET", v.includes("rego")],
            ].map(([label, ok]) => (
              <li key={label as string} className="flex items-center justify-between gap-3">
                <span>{label}</span>
                {ok ? (
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-success">
                    <Check className="size-4" strokeWidth={2.6} aria-hidden /> Verified
                  </span>
                ) : (
                  <span className="text-[12.5px] text-muted">Not yet</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-4 text-[12.5px] text-muted">
            <CalendarDays className="size-3.5" aria-hidden /> On REGOMARKET since {since}
          </p>
        </div>
      </aside>
    </div>
  );

  return (
    <div className="bg-white">
      <JsonLd data={jsonLd} />
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
              <Link href="/shops" className="hover:text-ink">
                Shops
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="max-w-[40ch] truncate text-ink/80">
              {shop.name}
            </li>
          </ol>
        </nav>

        {/* ---------- Storefront header ---------- */}
        <section aria-labelledby="shop-name" className="mt-4">
          <div className="relative h-[150px] overflow-hidden rounded-2xl bg-stone sm:h-[210px] lg:h-[260px]">
            <Photo
              media={{ ...shop.cover, alt: `${shop.name} storefront` }}
              sizes="(min-width: 1440px) 1360px, 100vw"
              priority
              fallback={<LandscapeArt art={shop.coverArt} label={shop.name} />}
            />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
          </div>

          <div className="flex flex-col gap-5 px-1 lg:flex-row lg:items-end lg:justify-between lg:px-6">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
              <ShopLogo shop={shop} className="-mt-10 size-[88px] rounded-[22px] sm:-mt-12 sm:size-[112px] [&>span]:text-[28px]" />
              <div className="min-w-0 sm:pt-4">
                <h1 id="shop-name" className="flex items-center gap-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
                  <span className="min-w-0">{shop.name}</span>
                  {verified && <BadgeCheck className="size-6 shrink-0 text-success md:size-7" role="img" aria-label="Verified shop" />}
                </h1>
                <p className="mt-1 text-[14.5px] text-ink/70">{shop.tagline}</p>
                <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-muted">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {where}
                  </span>
                  <Link href={routes.search({ category: category.slug })} className="hover:text-ink">
                    {category.name}
                  </Link>
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-3.5 fill-gold text-gold" aria-hidden />
                    <span className="font-semibold text-ink">{shop.rating.toFixed(1)}</span> ({shop.reviewCount})
                  </span>
                  <OpenStatus hours={shop.hours} />
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 pb-1">
              <FollowButton shopId={shop.id} shopName={shop.name} tone="primary" className="h-11 min-w-0 flex-1 rounded-full px-4 text-[14.5px] sm:flex-none sm:px-6" />
              <Link
                href={`/messages?shop=${shop.slug}`}
                className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-4 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink sm:flex-none sm:px-5"
              >
                <MessageSquareText className="size-[18px] shrink-0" aria-hidden />
                Message
              </Link>
              {seller.whatsapp && (
                <Link
                  href={`/messages?shop=${shop.slug}&via=whatsapp`}
                  aria-label={`WhatsApp ${shop.name}`}
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-[#1f7a52] text-white transition-colors hover:bg-[#186643]"
                >
                  <WhatsAppIcon size={19} />
                </Link>
              )}
              <ShareButton title={shop.name} />
            </div>
          </div>

          {/* Numbers */}
          <dl className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-line md:grid-cols-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={[
                  "flex flex-col-reverse items-center gap-0.5 px-2 py-4 text-center",
                  i % 3 !== 0 ? "border-l border-line" : "",
                  i >= 3 ? "border-t border-line md:border-t-0" : "",
                  i === 3 ? "md:border-l" : "",
                ].join(" ")}
              >
                <dt className="text-[12px] text-muted">{s.label}</dt>
                <dd className="inline-flex items-center gap-1 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                  {s.star && <Star className="size-4 fill-gold text-gold" aria-hidden />}
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          {/* Trust chips */}
          <ul className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {trust.map(({ Icon, label }) => (
              <li key={label} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-mint px-3 text-[12.5px] font-medium text-mountain">
                <Icon className="size-3.5" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Tabs ---------- */}
        <div className="mt-8">
          <ShopTabs
            tabs={[
              { id: "products", label: "Products", count: products.length },
              { id: "reviews", label: "Reviews", count: shop.reviewCount },
              { id: "about", label: "About" },
            ]}
            panels={[
              <ShopProducts key="p" products={products} shopName={shop.name} />,
              <ShopReviews key="r" shop={shop} reviews={reviews} />,
              <div key="a">{about}</div>,
            ]}
            aside={
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
                <Clock className="size-4" aria-hidden />
                {shop.hours.days} · {formatHour(shop.hours.open)} – {formatHour(shop.hours.close)}
              </span>
            }
          />
        </div>

        {/* ---------- More shops ---------- */}
        {similar.length > 0 && (
          <section aria-labelledby="more-shops" className="mt-20">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 id="more-shops" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
                More shops you may like
              </h2>
              <Link href="/shops" className="text-[14px] font-semibold text-mountain hover:underline">
                All shops
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {similar.map((s) => (
                <li key={s.id}>
                  <ShopCard shop={s} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
