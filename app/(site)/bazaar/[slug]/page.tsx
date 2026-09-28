import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Package, Sparkles, Store } from "lucide-react";
import { getBazaarBySlug, getBazaarSlugs } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { ProductCard } from "@/components/listings/product-card";
import { ShopCard } from "@/components/shops/shop-card";
import { BazaarCard } from "@/components/bazaar/bazaar-card";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getBazaarSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await getBazaarBySlug((await params).slug);
  if (!data) return { title: "Bazaar not found" };
  const { bazaar } = data;
  return {
    title: `${bazaar.name} · Shops & ads`,
    description: bazaar.description,
    alternates: { canonical: routes.bazaar(bazaar.slug) },
  };
}

export default async function BazaarPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getBazaarBySlug((await params).slug);
  if (!data) notFound();
  const { bazaar, shops, listings, others } = data;
  const district = districtBySlug[bazaar.district].name;

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Bazaars", href: "/bazaar" }, { label: bazaar.name }]} />

        {/* Hero */}
        <section className="relative isolate mt-4 overflow-hidden rounded-2xl bg-forest text-white">
          <div className="absolute inset-0 -z-10">
            <Photo media={{ ...bazaar.image, alt: bazaar.name }} sizes="(min-width: 1440px) 1360px, 100vw" priority fallback={<LandscapeArt art={bazaar.art} label={bazaar.name} />} />
          </div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#021d16]/90 via-[#021d16]/60 to-[#021d16]/10" />
          <div className="flex min-h-[260px] flex-col justify-end p-6 md:min-h-[320px] md:p-10">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-white/80">
              <MapPin className="size-4 text-gold-soft" aria-hidden /> {bazaar.town}, {district}
            </p>
            <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.02em] md:text-[44px]">{bazaar.name}</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/80">{bazaar.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-medium backdrop-blur">
                <Store className="size-4 text-gold-soft" aria-hidden /> {bazaar.shopCount} shops
              </span>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-medium backdrop-blur">
                <Package className="size-4 text-gold-soft" aria-hidden /> {formatNumber(bazaar.productCount)} listings
              </span>
              <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-medium backdrop-blur">
                <Sparkles className="size-4 text-gold-soft" aria-hidden /> {bazaar.newToday} new today
              </span>
            </div>
          </div>
        </section>

        {/* Known for */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-muted">Known for:</span>
          {bazaar.highlights.map((h) => (
            <Link
              key={h}
              href={routes.search({ q: h, district: bazaar.district })}
              className="inline-flex h-8 items-center rounded-full bg-stone px-3.5 text-[13px] font-medium text-ink/80 hover:bg-line"
            >
              {h}
            </Link>
          ))}
        </div>

        {/* Shops */}
        <section aria-labelledby="bz-shops" className="mt-12">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 id="bz-shops" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Shops on REGOMARKET
            </h2>
            <Link href={`/shops?district=${bazaar.district}`} className="text-[14px] font-semibold text-mountain hover:underline">
              All shops in {district}
            </Link>
          </div>
          {shops.length ? (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {shops.map((s) => (
                <li key={s.id}>
                  <ShopCard shop={s} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-10 text-center text-[14px] text-muted">
              No shops from {bazaar.name} have opened here yet.{" "}
              <Link href="/create-shop" className="font-semibold text-mountain underline underline-offset-4">
                Open yours first
              </Link>
              .
            </p>
          )}
        </section>

        {/* Ads */}
        <section aria-labelledby="bz-ads" className="mt-14">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
            <h2 id="bz-ads" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
              Latest in {district}
            </h2>
            <Link href={routes.search({ district: bazaar.district })} className="text-[14px] font-semibold text-mountain hover:underline">
              See all {listings.length}
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
            {listings.slice(0, 10).map((l) => (
              <li key={l.id}>
                <ProductCard listing={l} />
              </li>
            ))}
          </ul>
        </section>

        {/* Other bazaars */}
        <section aria-labelledby="bz-more" className="mt-16">
          <h2 id="bz-more" className="border-b border-line pb-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
            Other bazaars
          </h2>
          <ul className="rail -mx-4 mt-6 gap-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {others.map((b) => (
              <li key={b.slug} className="aspect-[4/5] w-[70%] shrink-0 sm:w-[40%] lg:aspect-[4/4.4] lg:w-auto">
                <BazaarCard bazaar={b} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
