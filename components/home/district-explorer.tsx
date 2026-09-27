import Link from "next/link";
import { ArrowUpRight, MapPinned } from "lucide-react";
import type { District } from "@/types";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { SectionHeader } from "@/components/common/section-header";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

const LAYOUT: Record<string, string> = {
  gilgit: "md:col-span-2 md:row-span-2",
  skardu: "lg:col-span-2 xl:row-span-2",
};

function DistrictTile({ d, big }: { d: District; big: boolean }) {
  return (
    <Link
      href={routes.search({ district: d.slug })}
      className="on-dark group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-lg bg-deep p-2 text-white md:p-2.5"
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
        {d.image ? (
          <Photo media={d.image} sizes="(min-width: 1280px) 33vw, 50vw" fallback={<LandscapeArt art={d.art} />} />
        ) : (
          <LandscapeArt art={d.art} />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c1a14]/80 via-[#0c1a14]/15 to-transparent" />

      <span
        aria-hidden
        className="glass-pill absolute right-3 top-3 grid size-9 place-items-center rounded-full text-mountain opacity-0 transition-all duration-300 group-hover:opacity-100 max-md:hidden md:right-4 md:top-4"
      >
        <ArrowUpRight className="size-4" />
      </span>

      <div className={cn("px-2 pb-1.5 md:px-2.5", big && "md:px-4 md:pb-3")}>
        <h3 className={cn("font-serif font-semibold leading-tight", big ? "text-[20px] md:text-[26px] xl:text-[30px]" : "text-[16px] md:text-[18px]")}>
          {d.name}
        </h3>
        <p className="tabular mt-0.5 text-[11.5px] text-white/80 md:text-[12.5px]">
          <span className="font-semibold text-white">{formatNumber(d.activeListings)}</span> active listings
        </p>
        {big && (
          <p className="mt-1.5 hidden text-[13px] text-white/70 md:block">
            {d.tehsils.map((t) => t.name).join(" · ")}
          </p>
        )}
      </div>
      
    </Link>
  );
}

export function DistrictExplorer({ districts }: { districts: District[] }) {
  const total = districts.reduce((n, d) => n + d.activeListings, 0);
  return (
    <section aria-labelledby="districts-title">
      <div className="shell section-y">
      <SectionHeader
        id="districts-title"
        eyebrow="11 districts · one marketplace"
        title="Browse by district"
        description="Ads near you, from Gilgit and Hunza to Skardu and Ghanche."
        action={{ label: "See all", href: "/search" }}
      />
      <ul className="mt-10 grid auto-rows-[112px] grid-cols-2 gap-3 md:auto-rows-[150px] md:grid-cols-3 md:gap-4 lg:auto-rows-[160px] lg:grid-cols-4 xl:auto-rows-[176px] xl:grid-cols-6">
        {districts.map((d) => (
          <li key={d.slug} className={LAYOUT[d.slug]}>
            <DistrictTile d={d} big={d.slug === "gilgit" || d.slug === "skardu"} />
          </li>
        ))}
        <li>
          <Link
            href="/search"
            className="glass-card glass-card-hover group flex h-full flex-col justify-between rounded-lg p-4 lg:p-5"
          >
            <span className="grid size-10 place-items-center rounded-md bg-mint text-mountain"><MapPinned className="size-5" strokeWidth={1.75} aria-hidden /></span>
            <span>
              <span className="block font-serif text-[18px] font-semibold leading-tight text-ink md:text-[20px]">All of GB</span>
              <span className="tabular text-[12px] text-muted md:text-[13px]">{formatNumber(total)} listings</span>
            </span>
          </Link>
        </li>
      </ul>
      </div>
    </section>
  );
}
