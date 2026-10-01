import Link from "next/link";
import { Plus } from "lucide-react";
import type { WantedCardData } from "@/types";
import { WantedCard } from "@/components/wanted/wanted-card";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stagger } from "@/components/motion/motion-root";

export function WantedSection({ requests }: { requests: WantedCardData[] }) {
  return (
    <section aria-labelledby="wanted-title" className="border-y border-line bg-cream">
      <div className="shell section-y">
        <SectionHeader
          id="wanted-title"
          eyebrow="Buyer requests"
          title="People are looking for"
          description="Have one of these? Send the buyer an offer. Can't find what you need? Post a request."
        >
          <Link href="/wanted/new" className={cn(buttonVariants({ variant: "primary" }), "hidden md:inline-flex")}>
            <Plus aria-hidden strokeWidth={2.2} /> Post a request
          </Link>
        </SectionHeader>


        <ul className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {requests.slice(0, 6).map((r, i) => (
            <li key={r.id} data-reveal="" style={stagger(i % 3)} className={cn(i > 2 && "hidden md:block")}>
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
