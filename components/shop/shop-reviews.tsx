import Link from "next/link";
import { MessageSquareText, PenLine, ShoppingBag } from "lucide-react";
import type { Shop } from "@/types";
import type { ShopReviewView } from "@/lib/data";
import { routes } from "@/lib/site";
import { formatNumber } from "@/lib/format";
import { Stars } from "@/components/common/stars";
import { cn } from "@/lib/utils";

const TONES = ["bg-[#2f6f57]", "bg-[#a0773a]", "bg-[#3e7391]", "bg-[#a86448]", "bg-[#5d7566]"];
const toneFor = (seed: string) => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/**
 * Star breakdown estimated from the average until per-review rows come from
 * Supabase (then: a simple GROUP BY rating).
 */
function breakdown(rating: number, total: number) {
  const five = Math.min(0.95, Math.max(0.3, (rating - 3.9) / 1.1));
  const rest = 1 - five;
  const shares = [five, rest * 0.7, rest * 0.18, rest * 0.07, rest * 0.05];
  return shares.map((s, i) => ({ stars: 5 - i, count: Math.round(s * total), pct: Math.round(s * 100) }));
}

export function ShopReviews({ shop, reviews }: { shop: Shop; reviews: ShopReviewView[] }) {
  const rows = breakdown(shop.rating, shop.reviewCount);
  const positive = rows[0].pct + rows[1].pct;

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">
      {/* Summary */}
      <aside>
        <div className="rounded-2xl border border-line p-6 lg:sticky lg:top-[150px]">
          <p className="text-[13px] font-medium text-muted">Customer rating</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-[46px] font-bold leading-none tracking-[-0.03em] text-ink">{shop.rating.toFixed(1)}</span>
            <div className="pb-1">
              <Stars rating={shop.rating} size={18} />
              <p className="mt-1 text-[12.5px] text-muted">{formatNumber(shop.reviewCount)} reviews</p>
            </div>
          </div>

          <ul className="mt-5 space-y-2" aria-label="Rating breakdown">
            {rows.map((r) => (
              <li key={r.stars} className="flex items-center gap-3 text-[12.5px]">
                <span className="w-9 shrink-0 font-medium text-ink">{r.stars} ★</span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-gold" style={{ width: `${r.pct}%` }} />
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums text-muted">{r.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-xl bg-mint px-4 py-3 text-[13px] font-medium text-mountain">
            {positive}% of buyers rate this shop 4 stars or more
          </p>

          <Link
            href={`/login?next=${encodeURIComponent(`${routes.shop(shop.slug)}#reviews`)}`}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong text-[14px] font-semibold text-ink transition-colors hover:border-ink"
          >
            <PenLine className="size-4" aria-hidden />
            Write a review
          </Link>
          <p className="mt-2 text-center text-[12px] text-muted">Only buyers who dealt with the shop can review.</p>
        </div>
      </aside>

      {/* List */}
      <div>
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-ink">What buyers say</h2>
          <p className="text-[12.5px] text-muted">
            Latest {reviews.length} of {formatNumber(shop.reviewCount)}
          </p>
        </div>

        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="py-6">
              <div className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white", toneFor(r.author))}
                >
                  {initials(r.author)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-[14.5px] font-semibold text-ink">{r.author}</p>
                    <p className="text-[12.5px] text-muted">{r.when}</p>
                  </div>
                  <p className="text-[12.5px] text-muted">{r.from}</p>
                  <Stars rating={r.rating} size={15} className="mt-2" />
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink/85">{r.text}</p>

                  {r.item && r.itemTitle && (
                    <Link
                      href={routes.listing(r.item)}
                      className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 text-[12.5px] font-medium text-ink/80 transition-colors hover:bg-line hover:text-ink"
                    >
                      <ShoppingBag className="size-3.5 shrink-0 text-muted" aria-hidden />
                      <span className="truncate">Bought: {r.itemTitle}</span>
                    </Link>
                  )}

                  {r.reply && (
                    <div className="mt-4 rounded-xl border-l-[3px] border-gold bg-cream px-4 py-3">
                      <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                        <MessageSquareText className="size-3.5 text-gold-ink" aria-hidden />
                        Reply from {shop.name}
                      </p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-ink/80">{r.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
