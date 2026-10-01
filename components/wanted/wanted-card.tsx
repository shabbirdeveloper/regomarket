import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import type { WantedCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { formatBudget, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";

/**
 * A buyer's request, set like a printed notice: what's wanted first, the
 * budget as the one number that matters, and who is asking at the bottom.
 * Flat navy, one accent, no decoration that isn't information.
 */
export function WantedCard({ request }: { request: WantedCardData }) {
  const cat = categoryBySlug[request.category];
  const details = [request.quantity, placeLabel(request.place, { withTown: true }), request.mode].filter(Boolean);

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-white/[0.07] bg-mountain p-6 text-white transition-colors duration-200 hover:border-white/20 focus-within:border-white/25">
      {/* Kind + when */}
      <p className="flex items-center justify-between gap-3 text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/60">
        <span>Wanted · {cat.shortName}</span>
        <span className="normal-case tracking-normal">{request.postedLabel}</span>
      </p>

      {/* What */}
      <h3 className="mt-3 line-clamp-2 min-h-[2.6em] text-[18px] font-semibold leading-[1.3] tracking-[-0.01em]">
        <Link href={routes.wanted(request.slug)} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {request.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[13.5px] text-white/70">{details.join("  ·  ")}</p>

      {/* Budget */}
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="text-[12px] text-white/60">Budget</p>
        <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.01em] tabular-nums">{formatBudget(request.budget)}</p>
      </div>

      {/* Who + action */}
      <footer className="mt-auto flex items-end justify-between gap-4 pt-5">
        <div className="min-w-0 text-[13px]">
          <p className="flex items-center gap-1 truncate font-medium text-white/90">
            <span className="truncate">{request.buyerName}</span>
            {request.buyerVerified && <BadgeCheck className="size-3.5 shrink-0 text-white/60" role="img" aria-label="Verified" />}
          </p>
          <p className="text-white/60">
            {request.buyerType === "Business" ? "Business" : "Individual"} · {request.offers} {request.offers === 1 ? "offer" : "offers"}
          </p>
        </div>
        <Link
          href={`${routes.wanted(request.slug)}#offer`}
          aria-label={`Send offer: ${request.title}`}
          className="relative z-10 inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-semibold text-[#e3c27e] underline-offset-4 hover:underline"
        >
          Send offer
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </footer>
    </article>
  );
}
