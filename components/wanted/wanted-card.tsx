import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Clock, MapPin, Package, Tag } from "lucide-react";
import type { WantedCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { CategoryIcon } from "@/components/common/category-icon";
import { formatBudget, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";

/**
 * A buyer's request in a mountain-green frame with a light centre:
 * what's wanted on the green, the budget and the facts on a cream panel,
 * who is asking and the one action back on the green.
 */
export function WantedCard({ request }: { request: WantedCardData }) {
  const cat = categoryBySlug[request.category];
  const facts = [
    request.quantity && { Icon: Package, text: request.quantity },
    { Icon: MapPin, text: placeLabel(request.place, { withTown: true }) },
    { Icon: Tag, text: request.mode },
    request.needBy && { Icon: Clock, text: request.needBy },
  ].filter(Boolean) as { Icon: typeof MapPin; text: string }[];

  return (
    <article data-spotlight="" className="press group relative flex h-full flex-col rounded-[22px] bg-mountain p-1.5 text-white shadow-[0_18px_40px_-26px_rgb(4_56_44/0.7)] transition-[transform,box-shadow] duration-300 ease-out md:hover:-translate-y-1 md:hover:shadow-[0_26px_50px_-24px_rgb(4_56_44/0.75)]">
      {/* What */}
      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-white/75">
            <span className="grid size-7 place-items-center rounded-[10px] bg-white/10 text-gold-soft">
              <CategoryIcon icon={cat.icon} size={15} strokeWidth={1.9} />
            </span>
            Wanted · {cat.shortName}
          </span>
          <span className="text-[12px] text-white/55">{request.postedLabel}</span>
        </div>
        <h3 className="mt-3 line-clamp-2 min-h-[2.6em] text-[17px] font-semibold leading-[1.3] tracking-[-0.01em]">
          <Link href={routes.wanted(request.slug)} className="after:absolute after:inset-0 after:rounded-[22px] after:content-[''] focus-visible:outline-none">
            {request.title}
          </Link>
        </h3>
      </div>

      {/* Light centre: budget + facts */}
      <div className="flex flex-1 flex-col rounded-[17px] bg-[#fbfaf6] px-4 py-4 text-ink">
        <p className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted">Budget</p>
        <p className="mt-1 text-[21px] font-bold leading-tight tracking-[-0.02em] text-mountain tabular-nums">{formatBudget(request.budget)}</p>
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {facts.map(({ Icon, text }) => (
            <li key={text} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] text-ink/75 ring-1 ring-line">
              <Icon className="size-3.5 shrink-0 text-mountain/70" aria-hidden />
              <span className="truncate">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Who + action */}
      <footer className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3">
        <div className="min-w-0 text-[12.5px] leading-snug">
          <p className="flex items-center gap-1 font-semibold text-white">
            <span className="truncate">{request.buyerName}</span>
            {request.buyerVerified && <BadgeCheck className="size-3.5 shrink-0 text-gold-soft" role="img" aria-label="Verified" />}
          </p>
          <p className="text-white/60">
            {request.buyerType === "Business" ? "Business" : "Individual"} · {request.offers} {request.offers === 1 ? "offer" : "offers"}
          </p>
        </div>
        <Link
          href={`${routes.wanted(request.slug)}#offer`}
          aria-label={`Send offer: ${request.title}`}
          className="shine relative z-10 inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold-soft pl-4 pr-3.5 text-[13px] font-semibold text-forest transition-colors hover:bg-white"
        >
          Send offer
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </footer>
    </article>
  );
}
