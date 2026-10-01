import Link from "next/link";
import { ArrowRight, BadgeCheck, Boxes, CalendarClock, MapPin, Package, Scale, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WantedCardData } from "@/types";
import { categoryBySlug } from "@/data/categories";
import { formatBudget, placeLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const MODE: Record<WantedCardData["mode"], { Icon: LucideIcon; cls: string }> = {
  Wholesale: { Icon: Package, cls: "bg-gold/15 text-gold-soft ring-gold/35" },
  Bulk: { Icon: Boxes, cls: "bg-[#3ccf91]/15 text-[#8be3bd] ring-[#3ccf91]/30" },
  Retail: { Icon: ShoppingBag, cls: "bg-[#5fb4f0]/15 text-[#a9d8fa] ring-[#5fb4f0]/30" },
  Rent: { Icon: CalendarClock, cls: "bg-[#f08a5f]/15 text-[#f7c3a9] ring-[#f08a5f]/30" },
};

const AVATAR_TONES = ["bg-[#2f6f57]", "bg-[#a0773a]", "bg-[#3e7391]", "bg-[#a86448]", "bg-[#5d7566]"];

/** Stable colour per name, so the same buyer always looks the same. */
function toneFor(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Tiny stacked circles standing in for the sellers who already replied. */
const RESPONDERS = ["H", "S", "M", "Z", "A"];

/**
 * A buyer's request, written like a post from a real person: who is asking,
 * what they want, what they'll pay — and how many sellers already answered.
 */
export function WantedCard({ request }: { request: WantedCardData }) {
  const cat = categoryBySlug[request.category];
  const mode = MODE[request.mode];
  const fresh = /^(\d+)(m|h) ago$/.test(request.postedLabel) && parseInt(request.postedLabel) <= 6;
  const shown = Math.min(3, request.offers);

  return (
    <article
      className={cn(
        // Premium dark navy, with a soft light glowing from the centre
        "group relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-white/10 p-5 text-white",
        "bg-[#0b1a33] bg-[radial-gradient(120%_85%_at_50%_45%,#2a4a7c_0%,#173260_42%,#0b1a33_100%)]",
        "shadow-[0_18px_40px_-26px_rgb(6_14_32/0.9)] transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
        "md:hover:-translate-y-1 md:hover:border-gold/50 md:hover:shadow-[0_30px_60px_-28px_rgb(6_14_32/0.95)]",
        "md:focus-within:-translate-y-1 md:focus-within:border-gold/50",
      )}
    >
      {/* Gold top edge that draws in on hover */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-soft transition-transform duration-500 ease-out md:group-hover:scale-x-100" />
      {/* Who is asking */}
      <header className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white",
            toneFor(request.buyerName),
          )}
        >
          {initials(request.buyerName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-[14.5px] font-semibold text-white">
            <span className="truncate">{request.buyerName}</span>
            {request.buyerVerified && (
              <BadgeCheck className="size-4 shrink-0 text-[#6fe0a8]" role="img" aria-label={`Verified ${request.buyerType === "Business" ? "business" : "buyer"}`} />
            )}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-white/60">
            {fresh && <span className="size-1.5 rounded-full bg-[#6fe0a8]" aria-hidden />}
            <span>{request.buyerType === "Business" ? "Business" : "Individual"}</span>
            <span aria-hidden>·</span>
            <span>{request.postedLabel}</span>
          </p>
        </div>
        <span className={cn("inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold ring-1 ring-inset", mode.cls)}>
          <mode.Icon className="size-3.5" aria-hidden />
          {request.mode}
        </span>
      </header>

      {/* What they want */}
      <p className="mt-4 text-[12px] font-medium text-gold-soft/85">{cat.shortName} · Looking for</p>
      <h3 className="mt-0.5 text-[16.5px] font-semibold leading-snug tracking-[-0.01em] text-white transition-colors md:group-hover:text-gold-soft">
        <Link href={routes.wanted(request.slug)} className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']">
          {request.title}
        </Link>
      </h3>

      <ul className="mt-3.5 flex flex-wrap gap-1.5 text-[12px] font-medium">
        {request.quantity && (
          <li className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-white/85 ring-1 ring-inset ring-white/10">
            <Scale className="size-3.5 text-white/55" aria-hidden />
            {request.quantity}
          </li>
        )}
        <li className="inline-flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-2.5 text-white/85 ring-1 ring-inset ring-white/10">
          <MapPin className="size-3.5 text-white/55" aria-hidden />
          {placeLabel(request.place, { withTown: true })}
        </li>
      </ul>

      {/* What they'll pay */}
      <div className="mt-4 flex items-baseline justify-between gap-3 rounded-lg bg-white/[0.07] px-3.5 py-2.5 ring-1 ring-inset ring-white/10 backdrop-blur-[2px] transition-colors md:group-hover:bg-white/[0.11]">
        <span className="text-[12px] font-medium text-white/60">Budget</span>
        <span className="text-right text-[16px] font-bold tracking-[-0.01em] text-gold-soft">{formatBudget(request.budget)}</span>
      </div>

      {/* Social proof + action */}
      <footer className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="flex items-center gap-2.5">
          {shown > 0 && (
            <span className="flex -space-x-2" aria-hidden>
              {RESPONDERS.slice(0, shown).map((r) => (
                <span
                  key={r}
                  className={cn(
                    "grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-[#132a50]",
                    toneFor(r + request.id),
                  )}
                >
                  {r}
                </span>
              ))}
            </span>
          )}
          <span className="text-[12.5px] leading-tight text-white/60">
            <span className="font-semibold text-white">{request.offers}</span> {request.offers === 1 ? "seller" : "sellers"}
            <br className="hidden sm:block" /> replied
          </span>
        </span>
        <Link
          href={`${routes.wanted(request.slug)}#offer`}
          aria-label={`Send offer: ${request.title}`}
          className="group/btn relative z-10 inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold-soft/70 px-4 text-[13px] font-semibold text-gold-soft transition-colors hover:bg-gold-soft hover:text-[#0b1a33] md:group-hover:border-gold-soft md:group-hover:bg-gold-soft md:group-hover:text-[#0b1a33]"
        >
          Send offer
          <ArrowRight className="size-4 transition-transform md:group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </footer>
    </article>
  );
}
