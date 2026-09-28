import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircleQuestion } from "lucide-react";
import { ContentPage } from "@/components/common/content-page";
import { ContactForm } from "@/components/help/contact-form";
import { WhatsAppIcon } from "@/components/common/brand-icons";

export const metadata: Metadata = { title: "Contact us", alternates: { canonical: "/contact" } };

const CHANNELS = [
  { key: "wa", t: "WhatsApp", s: "Fastest for quick questions", v: "+92 355 0000000" },
  { key: "mail", t: "Email", s: "For documents and partnerships", v: "support@regomarket.pk" },
  { key: "pin", t: "Office", s: "Visits by appointment", v: "Jutial, Gilgit" },
  { key: "clock", t: "Hours", s: "Pakistan time", v: "Mon – Sat, 9 AM – 7 PM" },
] as const;

function ChannelIcon({ k }: { k: (typeof CHANNELS)[number]["key"] }) {
  if (k === "wa") return <WhatsAppIcon size={18} />;
  if (k === "mail") return <Mail className="size-[18px]" aria-hidden />;
  if (k === "pin") return <MapPin className="size-[18px]" aria-hidden />;
  return <Clock className="size-[18px]" aria-hidden />;
}

export default function ContactPage() {
  return (
    <ContentPage crumbs={[{ label: "Contact" }]} title="Contact us" intro="Our small team is based in Gilgit. Write to us about anything: your account, an order, or opening a shop." wide>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ContactForm />
        <aside className="space-y-3">
          {CHANNELS.map(({ key, t, s, v }) => (
            <div key={t} className="flex items-start gap-3 rounded-2xl bg-cream p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-mountain ring-1 ring-line">
                <ChannelIcon k={key} />
              </span>
              <span>
                <span className="block text-[15px] font-semibold text-ink">{t}</span>
                <span className="block text-[12.5px] text-muted">{s}</span>
                <span className="mt-1 block text-[14px] font-medium text-ink">{v}</span>
              </span>
            </div>
          ))}
          <Link href="/help" className="flex items-center gap-3 rounded-2xl border border-line p-5 hover:bg-cream">
            <MessageCircleQuestion className="size-6 text-mountain" aria-hidden />
            <span>
              <span className="block text-[15px] font-semibold text-ink">Help centre</span>
              <span className="block text-[12.5px] text-muted">Most questions are answered here</span>
            </span>
          </Link>
        </aside>
      </div>
    </ContentPage>
  );
}
