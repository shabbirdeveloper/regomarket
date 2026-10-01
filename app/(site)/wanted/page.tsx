import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, MessageSquareText, Plus, Send } from "lucide-react";
import type { CategorySlug, WantedRequest } from "@/types";
import { getAllWanted } from "@/lib/data";
import { wantedRequests } from "@/data/wanted";
import { categoryBySlug } from "@/data/categories";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { WantedCard } from "@/components/wanted/wanted-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Wanted — what buyers in GB are looking for",
  description: "Buyers and businesses in Gilgit-Baltistan post what they need. Send them an offer, or post your own request.",
  alternates: { canonical: "/wanted" },
};

const MODES: WantedRequest["mode"][] = ["Wholesale", "Bulk", "Retail", "Rent"];

export default async function WantedPage({ searchParams }: { searchParams: Promise<{ category?: string; mode?: string }> }) {
  const sp = await searchParams;
  const category = sp.category && sp.category in categoryBySlug ? (sp.category as CategorySlug) : undefined;
  const mode = MODES.find((m) => m.toLowerCase() === sp.mode?.toLowerCase());
  const list = await getAllWanted({ category, mode });

  const href = (c?: string, m?: string) => {
    const qs = new URLSearchParams();
    if (c) qs.set("category", c);
    if (m) qs.set("mode", m.toLowerCase());
    const s = qs.toString();
    return s ? `/wanted?${s}` : "/wanted";
  };
  const cats = [...new Set(wantedRequests.map((w) => w.category))];
  const chip = (on: boolean) =>
    cn(
      "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13.5px] font-medium transition-colors",
      on ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
    );

  return (
    <div className="bg-white">
      <div className="shell pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Wanted" }]} />

        <header className="mt-4 grid grid-cols-1 gap-6 rounded-2xl bg-cream p-6 md:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold text-[#c2410c] ring-1 ring-line">
              <Megaphone className="size-3.5" aria-hidden /> Buyers are asking
            </p>
            <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[38px]">
              Wanted in Gilgit-Baltistan
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
              People and businesses post what they need. If you have it, send an offer. If you need something, post it free and let
              sellers come to you.
            </p>
            <Link
              href="/wanted/new"
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-mountain px-6 text-[15px] font-semibold text-white hover:bg-mountain-hover"
            >
              <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden /> Post a request
            </Link>
          </div>
          <ol className="grid gap-3">
            {[
              { Icon: Megaphone, t: "Post what you need", s: "Item, quantity, budget and town." },
              { Icon: Send, t: "Sellers send offers", s: "Shops and people across GB reply." },
              { Icon: MessageSquareText, t: "Chat and choose", s: "Compare, ask, and meet the best one." },
            ].map(({ Icon, t, s }, i) => (
              <li key={t} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-line">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-mountain">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <div>
                  <p className="text-[14.5px] font-semibold text-ink">
                    {i + 1}. {t}
                  </p>
                  <p className="text-[13px] text-muted">{s}</p>
                </div>
              </li>
            ))}
          </ol>
        </header>

        <div className="mt-8 space-y-3">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            <Link href={href(undefined, mode)} className={chip(!category)}>
              All categories
            </Link>
            {cats.map((c) => (
              <Link key={c} href={href(c, mode)} className={chip(category === c)}>
                {categoryBySlug[c].shortName}
              </Link>
            ))}
          </div>
          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <span className="shrink-0 text-[12.5px] font-medium text-muted">Type:</span>
            {[undefined, ...MODES].map((m) => (
              <Link
                key={m ?? "any"}
                href={href(category, m)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-[12.5px] font-medium transition-colors",
                  mode === m ? "border-ink bg-ink text-white" : "border-line text-ink/80 hover:border-ink/40",
                )}
              >
                {m ?? "Any"}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[13px] text-muted">
          <span className="font-semibold text-ink">{list.length}</span> open {list.length === 1 ? "request" : "requests"}
        </p>

        {list.length ? (
          <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((w) => (
              <li key={w.id} data-reveal="">
                <WantedCard request={w} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-line-strong px-6 py-14 text-center">
            <p className="text-[16px] font-semibold text-ink">No requests here yet</p>
            <p className="mt-1 text-[14px] text-muted">Be the first to post what you need.</p>
            <Link href="/wanted/new" className="mt-5 inline-flex h-10 items-center rounded-full bg-mountain px-5 text-[13.5px] font-semibold text-white">
              Post a request
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
