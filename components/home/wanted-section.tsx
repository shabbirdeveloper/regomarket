import Link from "next/link";
import { Plus } from "lucide-react";
import type { WantedCardData } from "@/types";
import { WantedCard } from "@/components/wanted/wanted-card";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = ["Buyers post what they need", "Sellers send offers", "Agree and deal locally"];

export function WantedSection({ requests }: { requests: WantedCardData[] }) {
  return (
    <section aria-labelledby="wanted-title" className="border-y border-line bg-paper">
      <div className="shell section-y">
        <SectionHeader
          id="wanted-title"
          eyebrow="Buyer requests"
          title="Wanted by Buyers"
          description="Real demand from across GB. If you have it, send an offer — if you need something, post a request and let sellers come to you."
        >
          <Link href="/wanted/new" className={cn(buttonVariants({ variant: "primary" }), "hidden md:inline-flex")}>
            <Plus aria-hidden strokeWidth={2.2} /> Post a request
          </Link>
        </SectionHeader>

        <ol className="mt-8 hidden flex-wrap items-center gap-x-8 gap-y-2 text-[13.5px] text-ink/80 md:flex">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-full border border-gold/60 text-[12px] font-semibold text-gold-ink">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {requests.slice(0, 6).map((r, i) => (
            <li key={r.id} className={cn(i > 2 && "hidden md:block")}>
              <WantedCard request={r} />
            </li>
          ))}
        </ul>

        <Link href="/wanted/new" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "mt-8 w-full md:hidden")}>
          <Plus aria-hidden strokeWidth={2.2} /> Post a request
        </Link>
        <MobileViewAll href="/wanted" label="See all buyer requests" />
      </div>
    </section>
  );
}
