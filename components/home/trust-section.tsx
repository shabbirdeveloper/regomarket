import Link from "next/link";
import { BadgeCheck, Building2, IdCard, Phone } from "lucide-react";

const tips = [
  {
    n: "1",
    title: "Meet in a public place",
    text: "A busy bazaar, a petrol pump or outside a bank. For land and houses, visit with someone you trust.",
  },
  {
    n: "2",
    title: "See it before you pay",
    text: "Check the phone, start the car, look at the animal in daylight. Ask for vaccination records and papers.",
  },
  {
    n: "3",
    title: "Never pay in advance",
    text: "Don't send Easypaisa, JazzCash or bank transfers to someone you haven't met. Real sellers don't ask for it.",
  },
];

const badges = [
  { Icon: Phone, label: "Phone verified", text: "Number confirmed by SMS code" },
  { Icon: IdCard, label: "ID verified", text: "CNIC checked privately, never shown" },
  { Icon: Building2, label: "Verified shop", text: "Address and trade checked by our GB team" },
  { Icon: BadgeCheck, label: "REGOMARKET verified", text: "Long record of good deals" },
];

/** Practical, specific safety advice — the kind a local would give you. */
export function TrustSection() {
  return (
    <section aria-labelledby="trust-title" className="border-y border-line bg-white">
      <div className="shell section-y">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div>
            <h2 id="trust-title" className="heading-section text-ink">
              Deal safely
            </h2>
            <p className="mt-1.5 text-[14.5px] text-muted">Three things that prevent almost every bad deal.</p>

            <ol className="mt-6 divide-y divide-line border-y border-line">
              {tips.map((t) => (
                <li key={t.n} className="flex gap-4 py-4">
                  <span className="tabular w-6 shrink-0 text-[20px] font-bold leading-6 text-gold">{t.n}</span>
                  <span>
                    <span className="block text-[15px] font-semibold text-ink">{t.title}</span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-muted">{t.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[13.5px] text-muted">
              Something looks wrong?{" "}
              <Link href="/help/report" className="font-medium text-mountain underline underline-offset-4">
                Report the ad
              </Link>{" "}
              and our team will check it.
            </p>
          </div>

          <div className="rounded-lg bg-cream p-5 md:p-6">
            <h3 className="text-[15px] font-semibold text-ink">What the badges mean</h3>
            <ul className="mt-4 space-y-3.5">
              {badges.map(({ Icon, label, text }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-[18px] shrink-0 text-success" strokeWidth={1.9} aria-hidden />
                  <span className="text-[14px] leading-snug">
                    <span className="font-medium text-ink">{label}</span>
                    <span className="block text-[13px] text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link href="/help/safety" className="mt-5 inline-block text-[13.5px] font-semibold text-mountain underline-offset-4 hover:underline">
              Read the full safety guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
