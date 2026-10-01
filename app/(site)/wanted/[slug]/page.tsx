import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarClock, Clock, MapPin, Scale, ShieldCheck, Tag, Users } from "lucide-react";
import { getWantedBySlug, getWantedSlugs } from "@/lib/data";
import { categoryBySlug } from "@/data/categories";
import { formatBudget, placeLabel, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProductCard } from "@/components/listings/product-card";
import { WantedCard } from "@/components/wanted/wanted-card";
import { OfferForm } from "@/components/wanted/offer-form";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getWantedSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const data = await getWantedBySlug((await params).slug);
  if (!data) return { title: "Request not found" };
  const w = data.request;
  return {
    title: `Wanted: ${w.title}`,
    description: `${w.buyerName} is looking for ${w.title.toLowerCase()} in ${placeLabel(w.place, { withTown: true })}. Budget ${formatBudget(w.budget)}. Send an offer on REGOMARKET.`,
    alternates: { canonical: routes.wanted(w.slug) },
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default async function WantedDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const data = await getWantedBySlug((await params).slug);
  if (!data) notFound();
  const { request: w, related, matching } = data;
  const cat = categoryBySlug[w.category];
  const where = placeLabel(w.place, { withTown: true });

  const facts: { Icon: typeof Tag; k: string; v: string }[] = [
    { Icon: Tag, k: "Category", v: cat.name },
    { Icon: Users, k: "Type", v: w.mode },
    ...(w.quantity ? [{ Icon: Scale, k: "Quantity", v: w.quantity }] : []),
    { Icon: MapPin, k: "Location", v: where },
    ...(w.needBy ? [{ Icon: CalendarClock, k: "Needed", v: w.needBy }] : []),
    { Icon: Clock, k: "Posted", v: w.postedLabel },
  ];

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Wanted", href: "/wanted" }, { label: w.title }]} />

        <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#fdeee8] px-2.5 py-1 text-[12px] font-semibold text-[#c2410c]">Wanted</span>
              <span className="rounded-full bg-stone px-2.5 py-1 text-[12px] font-medium text-ink/75">{w.mode}</span>
              <Link href={`/wanted?category=${w.category}`} className="rounded-full bg-stone px-2.5 py-1 text-[12px] font-medium text-ink/75 hover:bg-line">
                {cat.shortName}
              </Link>
            </div>
            <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[32px]">{w.title}</h1>
            <p className="mt-2 text-[14px] text-muted">
              {w.buyerName} is looking for this in {where}. {w.offers} {w.offers === 1 ? "seller has" : "sellers have"} replied so far.
            </p>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-3 rounded-2xl bg-mint px-5 py-4">
              <div>
                <p className="text-[12.5px] font-medium text-mountain/80">Budget</p>
                <p className="text-[26px] font-bold tracking-[-0.02em] text-mountain">{formatBudget(w.budget)}</p>
              </div>
              {w.budget.negotiable && <span className="rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-mountain">Open to offers</span>}
            </div>

            <dl className="mt-6 grid grid-cols-1 overflow-hidden rounded-xl border border-line sm:grid-cols-2">
              {facts.map(({ Icon, k, v }, i) => (
                <div key={k} className={`flex items-center gap-3 border-line px-4 py-3.5 ${i > 0 ? "border-t" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${i % 2 === 1 ? "sm:border-l" : ""}`}>
                  <Icon className="size-[18px] shrink-0 text-muted" aria-hidden />
                  <dt className="text-[13.5px] text-muted">{k}</dt>
                  <dd className="ml-auto text-right text-[14px] font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="w-note" className="mt-8">
              <h2 id="w-note" className="text-[18px] font-semibold text-ink">
                From the buyer
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                {w.details ??
                  `Looking for ${w.title.toLowerCase()}${w.quantity ? ` (${w.quantity})` : ""} in ${where}. Please send your best price with photos and when you can deliver.`}
              </p>
            </section>

            {matching.length > 0 && (
              <section aria-labelledby="w-match" className="mt-12">
                <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
                  <h2 id="w-match" className="text-[18px] font-semibold text-ink">
                    Ads that might fit
                  </h2>
                  <Link href={routes.search({ category: w.category })} className="text-[13.5px] font-semibold text-mountain hover:underline">
                    More {cat.shortName}
                  </Link>
                </div>
                <ul className="mt-5 grid grid-cols-2 gap-3 md:gap-x-5 md:gap-y-8 xl:grid-cols-4">
                  {matching.map((l) => (
                    <li key={l.id}>
                      <ProductCard listing={l} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Offer box */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-[96px]">
              <div className="rounded-2xl border border-line p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#2f6f57] text-[15px] font-semibold text-white">
                    {initials(w.buyerName)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[15.5px] font-semibold text-ink">
                      {w.buyerName}
                      {w.buyerVerified && <BadgeCheck className="size-[18px] shrink-0 text-success" aria-label="Verified" />}
                    </p>
                    <p className="text-[12.5px] text-muted">
                      {w.buyerType} buyer · {w.buyerVerified ? "Phone & ID checked" : "Phone checked"}
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <p className="text-[16px] font-semibold text-ink">Have this? Send an offer</p>
                  <p className="mt-0.5 text-[13px] text-muted">The buyer sees your price and can chat with you.</p>
                  <div className="mt-4">
                    <OfferForm buyerName={w.buyerName} title={w.title} unit={w.budget.unit ? unitLabel(w.budget.unit) : undefined} />
                  </div>
                </div>
              </div>
              <p className="flex items-start gap-2 px-1 text-[12.5px] leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                Never share OTP codes, and don&apos;t send goods before payment is confirmed.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="w-more" className="mt-16">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-3">
              <h2 id="w-more" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
                More buyer requests
              </h2>
              <Link href="/wanted" className="text-[14px] font-semibold text-mountain hover:underline">
                See all
              </Link>
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <WantedCard request={r} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
