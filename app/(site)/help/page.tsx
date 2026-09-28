import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Flag, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { faqs } from "@/data/help";
import { ContentPage } from "@/components/common/content-page";
import { HelpCenter } from "@/components/help/help-center";

export const metadata: Metadata = { title: "Help centre", alternates: { canonical: "/help" } };

export default function HelpPage() {
  return (
    <ContentPage crumbs={[{ label: "Help" }]} title="How can we help?" intro="Quick answers about buying, selling, shops and your account." wide>
      <HelpCenter faqs={faqs} />
      <ul className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/help/safety", Icon: ShieldCheck, t: "Safety tips", s: "Deal safely in person and online" },
          { href: "/help/verification", Icon: BadgeCheck, t: "Verified badges", s: "What each badge means" },
          { href: "/help/report", Icon: Flag, t: "Report a problem", s: "Fake ad, scam or abuse" },
          { href: "/contact", Icon: MessageCircleQuestion, t: "Contact us", s: "Talk to our team in Gilgit" },
        ].map(({ href, Icon, t, s }) => (
          <li key={href}>
            <Link href={href} className="flex h-full items-start gap-3 rounded-2xl bg-cream p-5 transition-colors hover:bg-stone">
              <Icon className="size-6 shrink-0 text-mountain" aria-hidden />
              <span>
                <span className="block text-[15px] font-semibold text-ink">{t}</span>
                <span className="block text-[13px] text-muted">{s}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
