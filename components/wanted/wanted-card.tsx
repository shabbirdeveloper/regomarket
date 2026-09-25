import Link from "next/link";
import { BadgeCheck, Send } from "lucide-react";
import type { WantedCardData } from "@/types";
import { formatBudget, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A buyer's request. Text-first with a muted gold header strip so it reads
 * as *demand*, never as a product for sale.
 */
export function WantedCard({ request }: { request: WantedCardData }) {
  const rows = [
    { k: "Location", v: placeLabel(request.place, { withTown: true }) },
    { k: "Budget", v: formatBudget(request.budget), strong: true },
    ...(request.quantity ? [{ k: "Quantity", v: request.quantity }] : []),
  ];

  return (
    <article className={cn(cardVariants({ variant: "notice" }), "flex h-full flex-col transition-colors hover:border-gold/70")}>
      <div className="flex items-center justify-between gap-3 border-b border-gold/25 bg-gold-wash px-5 py-2.5">
        <span className="eyebrow text-gold-ink">
          Wanted <span aria-hidden>·</span> {request.mode}
        </span>
        <span className="text-[12px] text-gold-ink/80">{request.postedLabel}</span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="heading-card text-ink">
          <Link href={routes.wanted(request.slug)} className="hover:text-mountain">
            {request.title}
          </Link>
        </h3>

        <dl className="mt-4 space-y-2 text-[14px]">
          <div className="flex items-baseline gap-3">
            <dt className="w-20 shrink-0 text-muted">Buyer</dt>
            <dd className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-ink">
              <span className="truncate font-medium">{request.buyerName}</span>
              {request.buyerVerified && (
                <span className="inline-flex items-center gap-0.5 text-[12.5px] font-medium text-success">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Verified {request.buyerType === "Business" ? "business" : "buyer"}
                </span>
              )}
            </dd>
          </div>
          {rows.map((r) => (
            <div key={r.k} className="flex items-baseline gap-3">
              <dt className="w-20 shrink-0 text-muted">{r.k}</dt>
              <dd className={cn("min-w-0 text-ink", r.strong ? "font-semibold" : "font-medium")}>{r.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="text-[12.5px] text-muted">
            <span className="font-semibold text-ink">{request.offers}</span> offers so far
          </span>
          <Link
            href={`${routes.wanted(request.slug)}#offer`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
            aria-label={`Send offer: ${request.title}`}
          >
            <Send aria-hidden /> Send Offer
          </Link>
        </div>
      </div>
    </article>
  );
}
