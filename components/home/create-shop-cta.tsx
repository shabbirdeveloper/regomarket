import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { MountainMark } from "@/components/common/ornaments";
import { cn } from "@/lib/utils";

const perks = ["Free to start", "Your own shop page & link", "Verified business badge", "Take orders & deliver locally"];

/** Thin-line shopfront beneath the Karakoram — soft gold on forest green */
function ShopIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 360 260" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 196 62 120l30 34 58-92 50 74 30-36 44 52 30-30 56 74" opacity=".5" />
        <path d="m136 84 14-22 16 24M217 112l13-16 12 15" opacity=".5" />
        <path d="M40 240h280" />
        <path d="M110 240V146h140v94" />
        <path d="M100 146h160l-12-24H112z" />
        <rect x="148" y="100" width="64" height="16" rx="2" />
        <path d="M166 240v-36a14 14 0 0 1 28 0v36" />
        <rect x="124" y="168" width="28" height="30" rx="2" />
        <path d="M138 168v30M124 183h28" opacity=".6" />
        <rect x="208" y="168" width="28" height="30" rx="2" />
        <path d="M222 168v30M208 183h28" opacity=".6" />
        <ellipse cx="72" cy="208" rx="8" ry="30" />
        <ellipse cx="292" cy="212" rx="7" ry="26" />
        <ellipse cx="306" cy="218" rx="6" ry="20" opacity=".7" />
      </g>
    </svg>
  );
}

export function CreateShopCTA() {
  return (
    <section aria-labelledby="cta-title" className="shell pb-16 md:pb-24 xl:pb-28">
      <div className="on-dark relative isolate overflow-hidden rounded-xl bg-forest px-6 py-12 text-white md:px-12 md:py-16 xl:px-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow flex items-center gap-2.5 text-gold-soft">
              <MountainMark className="h-3 w-7 text-gold-soft" />
              For GB businesses
            </p>
            <h2 id="cta-title" className="heading-section mt-4 max-w-[20ch] text-white">
              Turn your local business into a digital shop
            </h2>
            <p className="mt-4 max-w-[52ch] text-[16px] leading-relaxed text-white/75">
              Create your REGO.pk store, showcase your products and connect directly with buyers across
              Gilgit-Baltistan.
            </p>
            <ul className="mt-7 grid max-w-xl gap-x-8 gap-y-3 sm:grid-cols-2">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[14.5px] text-white/85">
                  <Check className="size-4 shrink-0 text-gold-soft" strokeWidth={2.4} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/create-shop" className={cn(buttonVariants({ variant: "light", size: "lg" }), "group")}>
                Create Your Shop
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link href="/help/shops" className={buttonVariants({ variant: "outline-light", size: "lg" })}>
                Learn More
              </Link>
            </div>
          </div>
          <ShopIllustration className="mx-auto hidden w-full max-w-[400px] text-gold-soft/70 lg:block" />
        </div>
      </div>
    </section>
  );
}
