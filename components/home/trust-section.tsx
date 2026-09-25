import Link from "next/link";
import { ArrowRight, BadgeCheck, IdCard, LockKeyhole, Smartphone, Star, Truck } from "lucide-react";
import { SectionHeader } from "@/components/common/section-header";

const items = [
  { Icon: Smartphone, title: "Phone Verified", text: "Every seller confirms their mobile number with a one-time code." },
  { Icon: IdCard, title: "Identity Verified", text: "Sellers can verify their CNIC privately. Documents are never shown publicly." },
  { Icon: BadgeCheck, title: "Verified Shops", text: "Businesses checked by our GB team — address, trade and contact details." },
  { Icon: Truck, title: "Delivery Available", text: "Selected verified shops take orders on REGOMARKET and deliver locally." },
  { Icon: Star, title: "Reviews & Track Record", text: "Ratings, member-since dates and completed deals on every seller." },
  { Icon: LockKeyhole, title: "Secure Messaging", text: "Chat without sharing your number until you're ready. Report anything that looks wrong." },
];

export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="shell section-y">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeader
            id="trust-title"
            eyebrow="Trust & safety"
            title="Trade locally. Trade with confidence."
            description="Every badge on REGOMARKET means something specific — so you always know who you're dealing with."
          />
          <div className="mt-8 rounded-lg border border-line bg-paper p-5 text-[14px] leading-relaxed text-ink/80">
            <p>
              <span className="font-semibold text-ink">Safety first:</span> meet in a public place, inspect items or
              animals in person, and never send advance payment to someone you haven&apos;t met.
            </p>
            <Link href="/help/safety" className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-mountain">
              Read safety tips
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {items.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-mint text-mountain">
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{title}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-muted">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
