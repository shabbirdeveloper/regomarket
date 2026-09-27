import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, Store } from "lucide-react";
import { getBazaars } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { BazaarCard } from "@/components/bazaar/bazaar-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bazaars of Gilgit-Baltistan",
  description: "Browse the shops of Skardu Bazaar, Gilgit's Raja Bazaar, Aliabad, Khaplu and Shigar markets on REGOMARKET.",
  alternates: { canonical: "/bazaar" },
};

export default async function BazaarsPage() {
  const bazaars = [...(await getBazaars())].sort((a, b) => b.shopCount - a.shopCount);
  const shops = bazaars.reduce((n, b) => n + b.shopCount, 0);
  const items = bazaars.reduce((n, b) => n + b.productCount, 0);
  const today = bazaars.reduce((n, b) => n + b.newToday, 0);

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Bazaars" }]} />

        <header className="mt-4 flex flex-col gap-5 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[36px]">Bazaars of Gilgit-Baltistan</h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Walk the main markets of GB from your phone. See which shops are in each bazaar, what they sell, and what came in today.
            </p>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-line rounded-2xl border border-line text-center">
            {[
              [formatNumber(shops), "Shops"],
              [formatNumber(items), "Listings"],
              [String(today), "New today"],
            ].map(([v, l]) => (
              <div key={l} className="flex flex-col-reverse px-5 py-3">
                <dt className="text-[12px] text-muted">{l}</dt>
                <dd className="text-[18px] font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </header>

        <ul className="mt-8 grid auto-rows-[300px] gap-4 sm:grid-cols-2 lg:auto-rows-[280px] lg:grid-cols-4 lg:gap-5">
          {bazaars.map((b, i) => (
            <li key={b.slug} className={cn(i === 0 && "sm:col-span-2 lg:row-span-2")}>
              <BazaarCard bazaar={b} featured={i === 0} />
            </li>
          ))}
        </ul>

        {/* Directory list */}
        <section aria-labelledby="all-bazaars" className="mt-14">
          <h2 id="all-bazaars" className="border-b border-line pb-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
            All bazaars
          </h2>
          <ul className="divide-y divide-line">
            {bazaars.map((b) => (
              <li key={b.slug}>
                <Link href={routes.bazaar(b.slug)} className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-ink group-hover:text-mountain">{b.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
                      <MapPin className="size-3.5" aria-hidden /> {b.town}, {districtBySlug[b.district].name}
                    </p>
                    <p className="mt-1.5 max-w-2xl text-[14px] text-ink/75">{b.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-5 text-[13px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Store className="size-4 text-mountain" aria-hidden />
                      <span className="font-semibold text-ink">{b.shopCount}</span> shops
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Package className="size-4 text-mountain" aria-hidden />
                      <span className="font-semibold text-ink">{formatNumber(b.productCount)}</span> listings
                    </span>
                    <ArrowRight className="size-4 text-ink transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
