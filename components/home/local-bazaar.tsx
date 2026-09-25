import type { Bazaar } from "@/types";
import { SectionHeader, MobileViewAll } from "@/components/common/section-header";
import { BazaarCard } from "@/components/bazaar/bazaar-card";

export function LocalBazaar({ bazaars }: { bazaars: Bazaar[] }) {
  return (
    <section aria-labelledby="bazaar-title" className="border-y border-line bg-paper">
      <div className="shell section-y">
        <SectionHeader
          id="bazaar-title"
          eyebrow="Only on REGO.pk"
          title="Local Bazaar"
          description="GB's real markets, online. Walk the shops of Skardu, Gilgit, Aliabad, Khaplu and Shigar — new arrivals and local offers, from home."
          action={{ label: "All bazaars", href: "/bazaar" }}
        />
        <ul className="rail -mx-4 mt-10 gap-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
          {bazaars.map((b) => (
            <li key={b.slug} className="w-[68%] shrink-0 xs:w-[58%] sm:w-[40%] md:w-[31%] lg:w-auto">
              <BazaarCard bazaar={b} />
            </li>
          ))}
        </ul>
        <MobileViewAll href="/bazaar" label="Explore all bazaars" />
      </div>
    </section>
  );
}
