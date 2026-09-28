import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, SearchX, Truck, X } from "lucide-react";
import { getCategories, getDistricts, searchListings, type SearchQuery } from "@/lib/data";
import { activeFilterCount, parseSearch, searchHref, SEARCH_SORTS, type RawParams } from "@/lib/search-params";
import { categoryBySlug } from "@/data/categories";
import { districtBySlug } from "@/data/locations";
import { popularSearches } from "@/lib/site";
import { formatNumber } from "@/lib/format";
import { CategoryIcon } from "@/components/common/category-icon";
import { ProductCard } from "@/components/listings/product-card";
import { FilterForm } from "@/components/search/filter-form";
import { FilterSheet } from "@/components/search/filter-sheet";
import { SearchFilters } from "@/components/search/search-filters";
import { SortMenu } from "@/components/search/sort-menu";
import { cn } from "@/lib/utils";

function headingFor(q: SearchQuery) {
  const cat = q.category ? categoryBySlug[q.category] : undefined;
  const where = q.district ? districtBySlug[q.district].name : "Gilgit-Baltistan";
  if (q.q) return { title: `“${q.q}”`, sub: `${cat ? `${cat.shortName} · ` : ""}${where}` };
  if (cat) return { title: cat.name, sub: `in ${where}` };
  if (q.district) return { title: `Ads in ${where}`, sub: "All categories" };
  return { title: "All ads", sub: "Across Gilgit-Baltistan" };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<RawParams> }): Promise<Metadata> {
  const q = parseSearch(await searchParams);
  const cat = q.category ? categoryBySlug[q.category].name : undefined;
  const where = q.district ? districtBySlug[q.district].name : "Gilgit-Baltistan";
  const title = q.q ? `${q.q} for sale in ${where}` : cat ? `${cat} in ${where}` : `Buy & sell in ${where}`;
  const filtered = activeFilterCount(q) > (q.category ? 1 : 0) + (q.district ? 1 : 0) || q.sort || q.page;
  return {
    title,
    description: `Browse ${cat ? cat.toLowerCase() : "ads"} from sellers and verified shops in ${where} on REGOMARKET.`,
    // Keep only clean category/district pages in search engines
    robots: q.q || filtered ? { index: false, follow: true } : undefined,
    alternates: { canonical: searchHref({ category: q.category, district: q.district }) },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const query = parseSearch(await searchParams);
  const [result, categories, districts] = await Promise.all([searchListings(query), getCategories(), getDistricts()]);
  const { items, total, page, pages } = result;
  const head = headingFor(query);
  const nFilters = activeFilterCount(query);
  const formKey = searchHref(query);

  /* Removable chips for everything that's on */
  const chips: { label: string; href: string }[] = [];
  if (query.q) chips.push({ label: `“${query.q}”`, href: searchHref(query, { q: undefined }) });
  if (query.category) chips.push({ label: categoryBySlug[query.category].shortName, href: searchHref(query, { category: undefined }) });
  if (query.district) chips.push({ label: districtBySlug[query.district].name, href: searchHref(query, { district: undefined }) });
  if (query.seller) chips.push({ label: query.seller === "shop" ? "Shops" : "Individuals", href: searchHref(query, { seller: undefined }) });
  if (query.condition) chips.push({ label: query.condition === "new" ? "New" : "Used", href: searchHref(query, { condition: undefined }) });
  if (query.min || query.max)
    chips.push({
      label: query.min && query.max ? `Rs ${formatNumber(query.min)} – ${formatNumber(query.max)}` : query.min ? `From Rs ${formatNumber(query.min)}` : `Up to Rs ${formatNumber(query.max!)}`,
      href: searchHref(query, { min: undefined, max: undefined }),
    });
  if (query.delivery) chips.push({ label: "Home delivery", href: searchHref(query, { delivery: undefined }) });
  if (query.verified) chips.push({ label: "Verified sellers", href: searchHref(query, { verified: undefined }) });
  if (query.wholesale) chips.push({ label: "Wholesale", href: searchHref(query, { wholesale: undefined }) });
  if (query.negotiable) chips.push({ label: "Negotiable", href: searchHref(query, { negotiable: undefined }) });

  const clearHref = searchHref({ q: query.q });
  const sortHrefs = Object.fromEntries(
    SEARCH_SORTS.map((s) => [s.value, searchHref(query, { sort: s.value === "relevance" ? undefined : s.value })]),
  );

  const filters = (prefix: string) => (
    <SearchFilters query={query} result={result} categories={categories} districts={districts} prefix={prefix} />
  );

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
            {query.category ? (
              <>
                <li>
                  <Link href="/search" className="hover:text-ink">
                    All ads
                  </Link>
                </li>
                <ChevronRight className="size-3.5" aria-hidden />
                <li aria-current="page" className="text-ink/80">
                  {categoryBySlug[query.category].shortName}
                </li>
              </>
            ) : (
              <li aria-current="page" className="text-ink/80">
                {query.q ? "Search" : "All ads"}
              </li>
            )}
          </ol>
        </nav>

        {/* Heading */}
        <header className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
          <div className="min-w-0">
            <h1 className="truncate text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
              {query.q && <span className="font-medium text-muted">Results for </span>}
              {head.title}
            </h1>
            <p className="mt-1 text-[14px] text-muted">{head.sub}</p>
          </div>
          <p className="text-[14px] text-muted">
            <span className="font-semibold text-ink">{formatNumber(total)}</span> {total === 1 ? "ad" : "ads"}
          </p>
        </header>

        {/* Category rail */}
        <div className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <Link
            href={searchHref(query, { category: undefined })}
            aria-current={!query.category ? "true" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-medium transition-colors",
              !query.category ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
            )}
          >
            All
          </Link>
          <Link
            href={searchHref(query, { delivery: query.delivery ? undefined : true })}
            aria-current={query.delivery ? "true" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-medium transition-colors",
              query.delivery ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
            )}
          >
            <Truck className={cn("size-4", query.delivery ? "text-white" : "text-mountain")} aria-hidden />
            Home delivery
          </Link>
          {categories.map((c) => {
            const on = query.category === c.slug;
            return (
              <Link
                key={c.slug}
                href={searchHref(query, { category: on ? undefined : c.slug })}
                aria-current={on ? "true" : undefined}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[13.5px] font-medium transition-colors",
                  on ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
                )}
              >
                <CategoryIcon icon={c.icon} size={16} strokeWidth={1.8} className={on ? "text-white" : "text-ink/60"} />
                {c.shortName}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-10">
          {/* Desktop sidebar */}
          <aside aria-label="Filters" className="hidden lg:block">
            <div className="no-scrollbar sticky top-[92px] max-h-[calc(100dvh-108px)] overflow-y-auto pb-6 pr-1">
              <div className="flex items-center justify-between pb-1">
                <p className="text-[16px] font-semibold text-ink">Filters</p>
                {nFilters > 0 && (
                  <Link href={clearHref} className="text-[13px] font-semibold text-mountain hover:underline">
                    Clear all
                  </Link>
                )}
              </div>
              <FilterForm key={formKey} auto>
                {filters("d")}
              </FilterForm>
            </div>
          </aside>

          {/* Results */}
          <section aria-label="Results" className="min-w-0">
            <div className="flex items-center gap-2">
              <FilterSheet key={formKey} count={nFilters} clearHref={clearHref} total={total}>
                {filters("m")}
              </FilterSheet>
              <div className="no-scrollbar -mr-4 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pr-4 sm:mr-0 sm:flex-wrap sm:pr-0">
                {chips.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    aria-label={`Remove ${c.label}`}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full bg-mint pl-3 pr-2 text-[12.5px] font-medium text-mountain hover:bg-mint-strong"
                  >
                    {c.label}
                    <X className="size-3.5" aria-hidden />
                  </Link>
                ))}
                {chips.length > 1 && (
                  <Link href="/search" className="shrink-0 px-1 text-[12.5px] font-semibold text-muted hover:text-ink">
                    Clear all
                  </Link>
                )}
              </div>
              <div className="hidden shrink-0 sm:block">
                <SortMenu key={query.sort ?? "relevance"} value={query.sort ?? "relevance"} hrefs={sortHrefs} />
              </div>
            </div>
            <div className="mt-3 sm:hidden">
              <SortMenu key={`m-${query.sort ?? "relevance"}`} value={query.sort ?? "relevance"} hrefs={sortHrefs} />
            </div>

            {items.length > 0 ? (
              <>
                <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 xl:grid-cols-4 2xl:grid-cols-5">
                  {items.map((l, i) => (
                    <li key={l.id}>
                      <ProductCard listing={l} priority={i < 4} />
                    </li>
                  ))}
                </ul>

                {pages > 1 && (
                  <nav aria-label="Pages" className="mt-12 flex items-center justify-center gap-1.5">
                    <PageLink href={page > 1 ? searchHref(query, { page: page - 1 }) : undefined} label="Previous page">
                      <ChevronLeft className="size-4" aria-hidden />
                    </PageLink>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <PageLink key={p} href={searchHref(query, { page: p })} current={p === page} label={`Page ${p}`}>
                        {p}
                      </PageLink>
                    ))}
                    <PageLink href={page < pages ? searchHref(query, { page: page + 1 }) : undefined} label="Next page">
                      <ChevronRight className="size-4" aria-hidden />
                    </PageLink>
                  </nav>
                )}
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
                <SearchX className="mx-auto size-10 text-muted" aria-hidden />
                <p className="mt-3 text-[17px] font-semibold text-ink">
                  No ads {query.q ? <>for &ldquo;{query.q}&rdquo;</> : "here"} yet
                </p>
                <p className="mx-auto mt-1 max-w-md text-[14px] text-muted">
                  {nFilters > 0 ? "Try removing a filter, or search a different word." : "Check the spelling, or try a local word like Khubani or Bakri."}
                </p>
                {nFilters > 0 && (
                  <Link
                    href={clearHref}
                    className="mt-5 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-[13.5px] font-semibold text-ink hover:border-ink"
                  >
                    Remove all filters
                  </Link>
                )}
                <div className="mx-auto mt-8 max-w-xl">
                  <p className="text-[12.5px] font-medium text-muted">People in GB are searching for</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {popularSearches.map((s) => (
                      <Link
                        key={s}
                        href={searchHref({ q: s })}
                        className="inline-flex h-8 items-center rounded-full bg-stone px-3.5 text-[13px] font-medium text-ink/80 hover:bg-line"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Wanted nudge */}
            <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl bg-cream p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#e0552b] ring-1 ring-line">
                  <Flame className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-[15.5px] font-semibold text-ink">Can&apos;t find {query.q ? <>&ldquo;{query.q}&rdquo;</> : "what you need"}?</p>
                  <p className="mt-0.5 text-[13.5px] text-muted">Post a Wanted request. Sellers across GB will send you offers.</p>
                </div>
              </div>
              <Link
                href={`/wanted/new${query.q ? `?q=${encodeURIComponent(query.q)}` : ""}`}
                className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-6 text-[14px] font-semibold text-white hover:bg-ink/85"
              >
                Post a Wanted request
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PageLink({ href, current, label, children }: { href?: string; current?: boolean; label: string; children: ReactNode }) {
  const cls = cn(
    "grid size-10 place-items-center rounded-full text-[14px] font-semibold transition-colors",
    current ? "bg-ink text-white" : "border border-line-strong text-ink hover:border-ink",
    !href && "pointer-events-none opacity-40",
  );
  if (!href) return <span className={cls} aria-hidden>{children}</span>;
  return (
    <Link href={href} aria-label={label} aria-current={current ? "page" : undefined} className={cls}>
      {children}
    </Link>
  );
}
