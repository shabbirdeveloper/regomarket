import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, HandHeart, MapPinned, MessageSquareText, Mountain, Store } from "lucide-react";
import { getAllListingCards, getBazaars, getShops } from "@/lib/data";
import { districts } from "@/data/locations";
import { ContentPage } from "@/components/common/content-page";
import { Photo } from "@/components/media/photo";
import { unsplash } from "@/data/media";

export const metadata: Metadata = {
  title: "About REGOMARKET",
  description: "REGOMARKET is Gilgit-Baltistan's own buy and sell marketplace, built for the people, shops and bazaars of GB.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const [ads, shops, bazaars] = await Promise.all([getAllListingCards(), getShops({ limit: 100 }), getBazaars()]);
  const numbers = [
    [String(ads.length), "Ads live now"],
    [String(shops.length), "Verified shops"],
    [String(bazaars.length), "Bazaars online"],
    [String(districts.length), "Districts covered"],
  ];

  return (
    <ContentPage
      crumbs={[{ label: "About" }]}
      eyebrow="Made in Gilgit-Baltistan"
      title="A marketplace for GB, by people from GB"
      intro="From Khunjerab to Chilas, people here buy and sell through family, friends and WhatsApp groups. REGOMARKET puts all of it in one trusted place."
      wide
    >
      <div className="relative h-[240px] overflow-hidden rounded-2xl md:h-[360px]">
        <Photo media={unsplash("photo-1748596499389-693c1f1569af", "Apricot orchards in Shigar valley", 1800, 900)} sizes="100vw" priority fallback={null} />
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {numbers.map(([v, l]) => (
          <div key={l} className="flex flex-col-reverse rounded-2xl border border-line p-5">
            <dt className="text-[13px] text-muted">{l}</dt>
            <dd className="text-[30px] font-bold tracking-[-0.02em] text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-[24px] font-bold tracking-[-0.02em] text-ink">Why we built it</h2>
          <div className="mt-3 space-y-3 text-[15.5px] leading-relaxed text-ink/80">
            <p>
              A farmer in Shigar with 40 KG of dried apricots, a family in Jutial looking for a house to rent, a student in Skardu selling
              a camera before university. Everyone in GB has something to sell or something to find, but the big national apps are built
              for Karachi and Lahore.
            </p>
            <p>
              REGOMARKET is built for here: our districts and towns, our bazaars, local words like khubani and akhrot, livestock and dry
              fruit sold by the maund, and deals done face to face.
            </p>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { Icon: MapPinned, t: "Only Gilgit-Baltistan", s: "Every ad is from GB, so what you see is near you." },
            { Icon: BadgeCheck, t: "Checked sellers", s: "Phone, ID and business checks, shown with a clear badge." },
            { Icon: Store, t: "Real shops and bazaars", s: "Your favourite shops from Raja Bazaar to Aliabad, online." },
            { Icon: MessageSquareText, t: "Chat and offers", s: "Talk, bargain and agree before you meet." },
          ].map(({ Icon, t, s }) => (
            <li key={t} className="rounded-2xl bg-cream p-5">
              <Icon className="size-6 text-mountain" aria-hidden />
              <p className="mt-3 text-[15px] font-semibold text-ink">{t}</p>
              <p className="mt-1 text-[13.5px] text-muted">{s}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-2xl bg-forest p-7 text-white md:p-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { Icon: Mountain, t: "Local first", s: "Built around how GB really trades, not copied from somewhere else." },
            { Icon: HandHeart, t: "Honest", s: "No fake discounts, no fake reviews, no hidden fees for buyers." },
            { Icon: BadgeCheck, t: "Safe", s: "Tools and habits that keep scammers out and your number private." },
          ].map(({ Icon, t, s }) => (
            <div key={t}>
              <Icon className="size-7 text-gold-soft" aria-hidden />
              <p className="mt-3 text-[17px] font-semibold">{t}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-white/75">{s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col items-start gap-5 rounded-2xl border border-line p-7 md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 className="text-[22px] font-bold tracking-[-0.02em] text-ink">Be part of it</h2>
          <p className="mt-1 text-[15px] text-muted">Post your first ad free, or bring your shop online.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/sell" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white hover:bg-mountain-hover">
            Post a free ad
          </Link>
          <Link href="/create-shop" className="inline-flex h-11 items-center gap-1.5 rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink hover:border-ink">
            Create a shop <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </ContentPage>
  );
}
