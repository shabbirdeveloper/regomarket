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
      className="on-dark group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-lg bg-deep p-4 text-white lg:p-5"
    >
      <div className="absolute inset-0 -z-10 transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
        {d.image ? (
          <Photo media={d.image} sizes="(min-width: 1280px) 33vw, 50vw" fallback={<LandscapeArt art={d.art} />} />
        ) : (
          <LandscapeArt art={d.art} />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-deep/85 via-deep/25 to-transparent" />

      <span
        aria-hidden
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-paper/90 text-mountain opacity-0 transition-all duration-300 group-hover:opacity-100 max-md:hidden md:right-4 md:top-4"
      >
        <ArrowUpRight className="size-4" />
      </span>

      <h3 className={cn("font-serif font-semibold leading-tight", big ? "text-[22px] md:text-[28px] xl:text-[32px]" : "text-[18px] md:text-[20px]")}>
        {d.name}
      </h3>
      <p className="tabular mt-0.5 text-[12px] text-white/80 md:text-[13px]">
        <span className="font-semibold text-white">{formatNumber(d.activeListings)}</span> active listings
      </p>
      {big && (
        <p className="mt-2 hidden text-[13px] text-white/65 md:block">
          {d.tehsils.map((t) => t.name).join(" · ")}
        </p>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 transition-colors group-hover:ring-white/40" />
    </Link>
  );
}

export function DistrictExplorer({ districts }: { districts: District[] }) {
  const total = districts.reduce((n, d) => n + d.activeListings, 0);
  return (
    <section aria-labelledby="districts-title" className="shell section-y">
      <SectionHeader
        id="districts-title"
        eyebrow="11 districts · one marketplace"
        title="Explore by District"
        description="See what's for sale close to home — from Gilgit and Hunza to Skardu and Ghanche."
        action={{ label: "All areas", href: "/search" }}
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
            className="group flex h-full flex-col justify-between rounded-lg border border-line bg-paper p-4 transition-colors hover:border-mountain/45 lg:p-5"
          >
            <span className="grid size-10 place-items-center rounded-md bg-stone text-mountain transition-colors group-hover:bg-mint"><MapPinned className="size-5" strokeWidth={1.75} aria-hidden /></span>
            <span>
              <span className="block font-serif text-[18px] font-semibold leading-tight text-ink md:text-[20px]">All of GB</span>
              <span className="tabular text-[12px] text-muted md:text-[13px]">{formatNumber(total)} listings</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
