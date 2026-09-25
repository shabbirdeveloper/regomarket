import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Store, Tag } from "lucide-react";
import type { Media } from "@/types";
import { Photo } from "@/components/media/photo";
import { RidgeLine } from "@/components/common/ornaments";
import { cn } from "@/lib/utils";

/** Illustration tile — uses the supplied artwork, or a quiet icon fallback */
function Art({ media, fallback }: { media?: Media; fallback: ReactNode }) {
  return (
    <span className="relative grid size-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl bg-sand text-mountain ring-1 ring-gold/25">
      {media ? <Photo media={media} sizes="72px" fallback={fallback} /> : fallback}
    </span>
  );
}

/** Floating card on the right of the hero (desktop) */
export function SellCard({
  art,
  className,
}: {
  art?: { sell?: Media; shop?: Media };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "on-light relative overflow-hidden rounded-2xl border border-gold/60 bg-parchment p-5 text-ink shadow-float",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Art media={art?.sell} fallback={<Tag className="size-7" strokeWidth={1.5} aria-hidden />} />
        <div className="pt-1">
          <h2 className="font-serif text-[19px] font-semibold leading-[1.15]">Sell Anything in GB — For Free</h2>
          <p className="mt-1.5 text-[13.5px] leading-snug text-ink/75">Post your ad in just 1 minute and reach local buyers.</p>
        </div>
      </div>
      <Link
        href="/sell"
        className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-mountain text-[16px] font-semibold text-white transition-colors hover:bg-forest"
      >
        <Plus className="size-[18px]" strokeWidth={2.2} aria-hidden />
        Post Free Ad
        <ArrowRight className="size-[18px] text-gold-soft transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>

      <div className="my-5 h-px bg-line" aria-hidden />

      <div className="flex items-start gap-4">
        <Art media={art?.shop} fallback={<Store className="size-7" strokeWidth={1.5} aria-hidden />} />
        <div className="pt-1">
          <h2 className="font-serif text-[19px] font-semibold leading-[1.15]">Create Your Shop</h2>
          <p className="mt-1.5 text-[13.5px] leading-snug text-ink/75">Grow your business online with your own digital store.</p>
        </div>
      </div>
      <Link
        href="/create-shop"
        className="group relative z-10 mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-mountain/70 bg-paper text-[16px] font-semibold text-mountain transition-colors hover:bg-mint"
      >
        Create Shop
        <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>

      <RidgeLine className="pointer-events-none mt-3 h-9 text-gold/45" />
    </div>
  );
}

/** Compact version for phones & tablets, placed under the category row */
export function SellBand() {
  return (
    <div className="shell pb-3 lg:hidden">
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/sell"
          className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-xl bg-mountain p-4 text-white ring-1 ring-inset ring-gold/60"
        >
          <span className="grid size-10 place-items-center rounded-full bg-white/10 ring-1 ring-gold-soft/50">
            <Plus className="size-5 text-gold-soft" strokeWidth={2.2} aria-hidden />
          </span>
          <span>
            <span className="block font-serif text-[17px] font-semibold leading-tight">Post Free Ad</span>
            <span className="mt-1 block text-[12.5px] text-white/75">Sell anything in 1 minute</span>
          </span>
        </Link>
        <Link
          href="/create-shop"
          className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-xl border border-gold/60 bg-parchment p-4"
        >
          <span className="grid size-10 place-items-center rounded-full bg-sand ring-1 ring-gold/40">
            <Store className="size-5 text-mountain" strokeWidth={1.7} aria-hidden />
          </span>
          <span>
            <span className="block font-serif text-[17px] font-semibold leading-tight text-ink">Create Shop</span>
            <span className="mt-1 block text-[12.5px] text-ink/70">Your own digital store</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
