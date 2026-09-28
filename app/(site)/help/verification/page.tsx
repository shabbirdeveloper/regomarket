import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, Phone, ShieldCheck, UserRoundCheck } from "lucide-react";
import { ContentPage } from "@/components/common/content-page";

export const metadata: Metadata = { title: "Verified badges", alternates: { canonical: "/help/verification" } };

const LEVELS = [
  { Icon: Phone, t: "Phone verified", who: "Everyone", how: "Signed in with a code sent to their mobile number.", cls: "bg-stone text-ink/70" },
  { Icon: UserRoundCheck, t: "ID verified", who: "People and shops", how: "Their CNIC was checked by our team and matches the name on the account.", cls: "bg-mint text-mountain" },
  { Icon: Building2, t: "Verified business", who: "Shops", how: "We saw a shop photo with the signboard, or a trade licence, and called the owner.", cls: "bg-mint text-mountain" },
  { Icon: ShieldCheck, t: "REGOMARKET verified", who: "Top shops", how: "Our team visited the shop in person, and it keeps good ratings and on-time orders.", cls: "bg-gold-wash text-gold-ink" },
];

export default function VerificationPage() {
  return (
    <ContentPage
      crumbs={[{ label: "Help", href: "/help" }, { label: "Verified badges" }]}
      title="What the green tick means"
      intro="Badges show what we checked about a seller. More checks, more trust. You can see them on every ad, shop and profile."
    >
      <ol className="space-y-3">
        {LEVELS.map(({ Icon, t, who, how, cls }, i) => (
          <li key={t} className="flex items-start gap-4 rounded-2xl border border-line p-5">
            <span className={`grid size-12 shrink-0 place-items-center rounded-full ${cls}`}>
              <Icon className="size-6" aria-hidden />
            </span>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold text-ink">
                <span className="text-muted">Level {i + 1}</span> {t}
              </p>
              <p className="text-[12.5px] font-medium text-muted">For: {who}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink/80">{how}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-cream p-5 text-[14px] leading-relaxed text-ink/80">
        <BadgeCheck className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
        <p>
          A badge means we checked who someone is, not the item itself. Always inspect before you pay, and read our{" "}
          <Link href="/help/safety" className="font-semibold text-mountain underline underline-offset-4">
            safety tips
          </Link>
          .
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link href="/create-shop" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover">
          Get your shop verified
        </Link>
        <Link href="/dashboard" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink hover:border-ink">
          Check my badges
        </Link>
      </div>
    </ContentPage>
  );
}
