import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Search, Store, Truck, Users, X } from "lucide-react";
import type { CategorySlug, DistrictSlug } from "@/types";
import { getShops, type ShopSort } from "@/lib/data";
import { shops as allShops } from "@/data/shops";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { ShopCard } from "@/components/shops/shop-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shops in Gilgit-Baltistan",
  description:
    "Verified local shops on REGOMARKET: dry fruits, honey, phones, cars, handicrafts, trekking gear and livestock from Hunza, Skardu, Gilgit and across GB.",
  alternates: { canonical: "/shops" },
};

type Params = { q?: string; category?: string; district?: string; delivery?: string; sort?: string };

const SORTS: { id: ShopSort; label: string }[] = [
  { id: "top", label: "Top rated" },
  { id: "followers", label: "Most followed" },
  { id: "reviews", label: "Most reviewed" },
];

/** Build a /shops URL from the current filters plus a change (undefined removes a key). */
function hrefWith(cur: Params, change: Partial<Params>) {
  const next = { ...cur, ...change };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/shops?${s}` : "/shops";
}

export default async function ShopsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const category = sp.category && sp.category in categoryBySlug ? (sp.category as CategorySlug) : undefined;
  const district = sp.district && sp.district in districtBySlug ? (sp.district as DistrictSlug) : undefined;
  const sort: ShopSort = SORTS.some((s) => s.id === sp.sort) ? (sp.sort as ShopSort) : "top";
  const delivery = sp.delivery === "1";
  const q = sp.q?.trim() || undefined;
  const cur: Params = { q, category, district, delivery: delivery ? "1" : undefined, sort: sort === "top" ? undefined : sort };

  const list = await getShops({ category, district, delivery, q, sort, limit: 60 });

  // Chip options come from the shops that exist, with live counts.
  const catCounts = new Map<CategorySlug, number>();
  const distCounts = new Map<DistrictSlug, number>();
  for (const s of allShops) {
    catCounts.set(s.category, (catCounts.get(s.category) ?? 0) + 1);
    distCounts.set(s.place.district, (distCounts.get(s.place.district) ?? 0) + 1);
  }
  const followers = allShops.reduce((n, s) => n + s.followers, 0);
  const filtered = Boolean(q || category || district || delivery);

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
            </li>
            <ChevronRight className="size-3.5" aria-hidden />
            <li aria-current="page" className="text-ink/80">
              Shops
            </li>
          </ol>
        </nav>

        {/* Intro + search */}
        <header className="mt-4 flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[36px]">Shops in Gilgit-Baltistan</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Real local businesses with a storefront on REGOMARKET. Follow a shop to see its new stock first.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-ink/80">
              <li className="inline-flex items-center gap-1.5">
                <Store className="size-4 text-mountain" aria-hidden /> {allShops.length} shops
              </li>
              <li className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-mountain" aria-hidden />
                {allShops.filter((s) => s.verifications.includes("business")).length} verified businesses
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Users className="size-4 text-mountain" aria-hidden /> {new Intl.NumberFormat("en-US").format(followers)} followers
              </li>
            </ul>
          </div>

          <form action="/shops" className="relative w-full lg:w-[420px]" role="search">
            {category && <input type="hidden" name="category" value={category} />}
            {district && <input type="hidden" name="district" value={district} />}
            {delivery && <input type="hidden" name="delivery" value="1" />}
            {sort !== "top" && <input type="hidden" name="sort" value={sort} />}
            <label htmlFor="shops-q" className="sr-only">
              Search shops
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="shops-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search shops, e.g. honey, phones, Skardu"
              className="h-12 w-full rounded-full border border-line-strong bg-cream pl-11 pr-28 text-[14.5px] text-ink outline-none transition placeholder:text-muted focus:border-mountain focus:bg-white focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full bg-mountain px-5 text-[13.5px] font-semibold text-white hover:bg-mountain-hover"
            >
              Search
            </button>
          </form>
        </header>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Category">
            <Chip href={hrefWith(cur, { category: undefined })} on={!category} label="All shops" count={allShops.length} />
            {[...catCounts].map(([slug, n]) => (
              <Chip key={slug} href={hrefWith(cur, { category: slug })} on={category === slug} label={categoryBySlug[slug].shortName} count={n} />
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="District">
              <span className="shrink-0 text-[12.5px] font-medium text-muted">District:</span>
              <SmallChip href={hrefWith(cur, { district: undefined })} on={!district} label="All GB" />
              {[...distCounts].map(([slug]) => (
                <SmallChip key={slug} href={hrefWith(cur, { district: slug })} on={district === slug} label={districtBySlug[slug].name} />
              ))}
            </div>

            <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <Link
                href={hrefWith(cur, { delivery: delivery ? undefined : "1" })}
                aria-pressed={delivery}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                  delivery ? "border-mountain bg-mint text-mountain" : "border-line-strong text-ink hover:border-ink",
                )}
              >
                <Truck className="size-4" aria-hidden /> Delivers
              </Link>
              <div className="flex h-9 shrink-0 items-center rounded-full bg-stone p-1" role="group" aria-label="Sort">
                {SORTS.map((s) => (
                  <Link
                    key={s.id}
                    href={hrefWith(cur, { sort: s.id === "top" ? undefined : s.id })}
                    aria-current={sort === s.id ? "true" : undefined}
                    className={cn(
                      "inline-flex h-7 items-center whitespace-nowrap rounded-full px-3 text-[12.5px] font-medium transition-colors",
                      sort === s.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink",
                    )}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Result line */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-[13px] text-muted">
          <span>
            <span className="font-semibold text-ink">{list.length}</span> {list.length === 1 ? "shop" : "shops"}
            {q && (
              <>
                {" "}
                for <span className="font-semibold text-ink">&ldquo;{q}&rdquo;</span>
              </>
            )}
          </span>
          {filtered && (
            <Link href="/shops" className="inline-flex items-center gap-1 rounded-full bg-stone px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-line">
              <X className="size-3.5" aria-hidden /> Clear filters
            </Link>
          )}
        </div>

        {list.length > 0 ? (
          <ul className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-4">
            {list.map((s) => (
              <li key={s.id}>
                <ShopCard shop={s} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
            <Store className="size-9 text-muted" aria-hidden />
            <p className="mt-3 text-[16px] font-semibold text-ink">No shops match yet</p>
            <p className="mt-1 max-w-md text-[14px] text-muted">
              Try another district or category. New shops open on REGOMARKET every week.
            </p>
            <Link href="/shops" className="mt-5 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-[13.5px] font-semibold text-ink hover:border-ink">
              See all shops
            </Link>
          </div>
        )}

        {/* Open a shop */}
        <section aria-labelledby="open-shop" className="mt-16 overflow-hidden rounded-2xl bg-forest text-white">
          <div className="flex flex-col gap-8 p-7 md:p-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="open-shop" className="text-[24px] font-semibold leading-tight tracking-[-0.02em] md:text-[28px]">
                Have a shop in GB? Open it on REGOMARKET.
              </h2>
              <ul className="mt-4 grid grid-cols-1 gap-2 text-[14px] text-white/80 sm:grid-cols-3 sm:gap-4">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" aria-hidden /> Free to start
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" aria-hidden /> Your own shop page
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-gold" aria-hidden /> Take orders online
                </li>
              </ul>
            </div>
            <Link
              href="/create-shop"
              className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-[15px] font-semibold text-ink transition-colors hover:bg-gold-soft"
            >
              Create your shop
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Chip({ href, on, label, count }: { href: string; on: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[13.5px] font-medium transition-colors",
        on ? "bg-ink text-white" : "bg-stone text-ink hover:bg-line",
      )}
    >
      {label}
      <span className={cn("text-[12px] tabular-nums", on ? "text-white/70" : "text-muted")}>{count}</span>
    </Link>
  );
}

function SmallChip({ href, on, label }: { href: string; on: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={on ? "true" : undefined}
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[12.5px] font-medium transition-colors",
        on ? "border-ink bg-ink text-white" : "border-line text-ink/80 hover:border-ink/40",
      )}
    >
      {label}
    </Link>
  );
}
