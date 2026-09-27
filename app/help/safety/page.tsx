import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Banknote, Eye, KeyRound, MapPin, MessageSquareText, PhoneOff, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Breadcrumb } from "@/components/common/breadcrumb";

export const metadata: Metadata = {
  title: "Safety tips — buy and sell safely in GB",
  description: "How to buy and sell safely on REGOMARKET: meet in public, check before you pay, never share OTP codes.",
  alternates: { canonical: "/help/safety" },
};

const BUYERS: { Icon: LucideIcon; t: string; s: string }[] = [
  { Icon: MapPin, t: "Meet in a public place", s: "A busy bazaar, a shop or outside a bank. Take a friend for big deals." },
  { Icon: Eye, t: "Check before you pay", s: "Test the phone, start the car, see the animal walk. Ask for vaccination or registration papers." },
  { Icon: Banknote, t: "No advance payments", s: "Don't send Easypaisa, JazzCash or bank transfers to someone you haven't met. Pay when you have the item." },
  { Icon: BadgeCheck, t: "Prefer verified sellers", s: "The green tick means we checked the phone and ID, or the shop's business." },
];

const SELLERS: { Icon: LucideIcon; t: string; s: string }[] = [
  { Icon: KeyRound, t: "Never share OTP codes", s: "REGOMARKET, Easypaisa and JazzCash will never ask for your code. Anyone who asks is a scammer." },
  { Icon: AlertTriangle, t: "Watch for fake payment messages", s: "Check your account balance yourself before handing over the item. Screenshots can be faked." },
  { Icon: Truck, t: "Delivery with care", s: "For orders outside your town, use cash on delivery or a known courier." },
  { Icon: MessageSquareText, t: "Keep the chat on REGOMARKET", s: "If something goes wrong, our team can see what was agreed." },
];

function List({ items }: { items: typeof BUYERS }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map(({ Icon, t, s }) => (
        <li key={t} className="flex gap-3 rounded-2xl border border-line bg-white p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-mint text-mountain">
            <Icon className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-ink">{t}</span>
            <span className="mt-0.5 block text-[13.5px] leading-relaxed text-muted">{s}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function SafetyPage() {
  return (
    <div className="bg-cream">
      <div className="shell max-w-5xl pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Help" }, { label: "Safety tips" }]} />
        <header className="mt-4 rounded-2xl bg-forest p-6 text-white md:p-10">
          <ShieldCheck className="size-9 text-gold-soft" aria-hidden />
          <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[36px]">Buy and sell safely</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/80">
            Most people in GB are honest. These simple habits keep the few who aren&apos;t away from your money.
          </p>
        </header>

        <section aria-labelledby="buyers" className="mt-10">
          <h2 id="buyers" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
            When you buy
          </h2>
          <List items={BUYERS} />
        </section>

        <section aria-labelledby="sellers" className="mt-10">
          <h2 id="sellers" className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
            When you sell
          </h2>
          <List items={SELLERS} />
        </section>

        <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-line bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <PhoneOff className="mt-0.5 size-6 shrink-0 text-[#c2410c]" aria-hidden />
            <div>
              <p className="text-[16px] font-semibold text-ink">Something feel wrong?</p>
              <p className="mt-0.5 text-[13.5px] text-muted">Stop the deal and report the ad or the user. We reply within a day.</p>
            </div>
          </div>
          <Link href="/messages" className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink px-6 text-[14px] font-semibold text-white hover:bg-ink/85">
            Contact support
          </Link>
        </section>
      </div>
    </div>
  );
}
