import Link from "next/link";
import { Check } from "lucide-react";
import { unsplash } from "@/data/media";
import { Photo } from "@/components/media/photo";
import { buttonVariants } from "@/components/ui/button";

const perks = ["Your own shop page and link", "All your products in one place", "Take orders if you deliver"];

const shopPhoto = unsplash("photo-1583440772344-edd2e043742c", "A dry fruit shop counter stacked with apricots and nuts", 1200, 900);

/** Plain, direct pitch to local shop owners — with a real shop, not an illustration. */
export function CreateShopCTA() {
  return (
    <section aria-labelledby="cta-title" className="shell section-y">
      <div className="grid overflow-hidden rounded-lg border border-line bg-white md:grid-cols-[1.15fr_1fr]">
        <div className="p-6 md:p-10 lg:p-12">
          <p className="text-[13px] font-semibold text-gold-ink">For shop owners</p>
          <h2 id="cta-title" className="mt-2 max-w-[22ch] text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink md:text-[30px]">
            Have a shop in Gilgit, Skardu or Hunza? Put it online for free.
          </h2>
          <ul className="mt-5 space-y-2.5">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[15px] text-ink/80">
                <Check className="size-4 shrink-0 text-mountain" strokeWidth={2.6} aria-hidden />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/create-shop" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Create your shop
            </Link>
            <Link href="/help/verification" className="px-2 text-[14px] font-semibold text-mountain underline-offset-4 hover:underline">
              How it works
            </Link>
          </div>
          <p className="mt-5 text-[13px] text-muted">Takes about 5 minutes. You can add products later from your phone.</p>
        </div>
        <div className="relative min-h-[220px] bg-stone md:min-h-full">
          <Photo media={shopPhoto} sizes="(min-width: 768px) 45vw, 100vw" fallback={null} />
        </div>
      </div>
    </section>
  );
}
