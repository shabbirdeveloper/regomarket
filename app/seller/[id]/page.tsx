import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, Flag, MapPin, MessageSquareText, Phone, ShieldCheck } from "lucide-react";
import { getSellerProfile } from "@/lib/data";
import { placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { ProductCard } from "@/components/listings/product-card";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const data = await getSellerProfile((await params).id);
  if (!data) return { title: "Seller not found" };
  return { title: `${data.seller.name} · Ads on REGOMARKET`, description: `See all ads from ${data.seller.name} in ${placeLabel(data.seller.place, { withTown: true })}.` };
}

const initials = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
  const data = await getSellerProfile((await params).id);
  if (!data) notFound();
  const { seller, ads } = data;
  if (seller.type === "shop" && seller.shopSlug) redirect(routes.shop(seller.shopSlug));

  const since = new Date(seller.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const idOk = seller.verifications.includes("identity");
  const first = seller.name.split(" ")[0];

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Sellers" }, { label: seller.name }]} />

        <section className="mt-5 flex flex-col gap-5 rounded-2xl border border-line p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-mint text-[20px] font-bold text-mountain md:size-20">{initials(seller.name)}</span>
            <div>
              <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-[-0.02em] text-ink md:text-[26px]">
                {seller.name}
                {idOk && <BadgeCheck className="size-6 text-success" aria-label="ID verified" />}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden /> {placeLabel(seller.place, { withTown: true })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden /> On REGOMARKET since {since}
                </span>
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5 text-[12px] font-medium">
                {seller.verifications.includes("phone") && (
                  <li className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-mountain">
                    <Phone className="size-3" aria-hidden /> Phone verified
                  </li>
                )}
                {idOk && (
                  <li className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-mountain">
                    <ShieldCheck className="size-3" aria-hidden /> ID verified
                  </li>
                )}
                {seller.responseTime && <li className="rounded-full bg-stone px-2.5 py-1 text-ink/70">Replies {seller.responseTime}</li>}
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            {ads[0] && (
              <Link
                href={`/messages?listing=${ads[0].slug}`}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover md:flex-none"
              >
                <MessageSquareText className="size-4" aria-hidden /> Message {first}
              </Link>
            )}
            <Link
              href={`/help/report?ad=${encodeURIComponent(seller.name)}`}
              aria-label={`Report ${seller.name}`}
              className="grid size-11 place-items-center rounded-full border border-line-strong text-muted hover:border-ink hover:text-ink"
            >
              <Flag className="size-4" aria-hidden />
            </Link>
          </div>
        </section>

        <section aria-labelledby="seller-ads" className="mt-10">
          <h2 id="seller-ads" className="border-b border-line pb-3 text-[20px] font-semibold tracking-[-0.02em] text-ink">
            Ads by {first} <span className="text-[15px] font-normal text-muted">({ads.length})</span>
          </h2>
          {ads.length ? (
            <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
              {ads.map((l) => (
                <li key={l.id}>
                  <ProductCard listing={l} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-[14px] text-muted">No live ads right now.</p>
          )}
        </section>
      </div>
    </div>
  );
}
