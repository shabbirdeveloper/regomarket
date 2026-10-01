import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { unsplash } from "@/data/media";
import { Photo } from "@/components/media/photo";
import { cn } from "@/lib/utils";

const banners = [
  {
    kicker: "In season",
    title: "Dry fruits, straight from GB orchards",
    sub: "Khubani, akhrot and badam from Hunza & Shigar",
    cta: "Shop dry fruits",
    href: "/search?category=dry-fruits",
    image: unsplash("photo-1583440772344-edd2e043742c", "A dry fruit stall piled with apricots and nuts", 1000, 700),
    tone: "from-[#1d1206]/85 via-[#1d1206]/45",
  },
  {
    kicker: "Delivered to your door",
    title: "Verified shops that deliver",
    sub: "Honey, crafts and more, anywhere in GB",
    cta: "See shops",
    href: "/search?delivery=true",
    image: unsplash("photo-1587049352851-8d4e89133924", "Jars of raw mountain honey", 1000, 700),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
  {
    kicker: "Maal maweshi",
    title: "Goats, sheep & yaks",
    sub: "From herders in Astore and Skardu",
    cta: "Browse livestock",
    href: "/search?category=livestock",
    image: unsplash("photo-1704571166240-a9a811a87ca3", "Goats grazing on a mountain pasture", 1000, 700),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
  {
    kicker: "Zameen & ghar",
    title: "Land and homes across GB",
    sub: "Plots, houses and shops by kanal",
    cta: "See property",
    href: "/search?category=property",
    image: unsplash("photo-1608463123864-40a2961b7d00", "A house with a lawn in Gilgit", 1000, 700),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
  {
    kicker: "Built for the mountains",
    title: "Jeeps, cars & bikes",
    sub: "4x4s for Deosai, daily rides for town",
    cta: "Browse vehicles",
    href: "/search?category=vehicles",
    image: unsplash("photo-1610064095022-db1b488c05f1", "A 4x4 jeep on a mountain road", 1000, 700),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
  {
    kicker: "Hand made in GB",
    title: "Pattu, caps & crafts",
    sub: "Straight from makers in Khaplu and Hunza",
    cta: "Shop crafts",
    href: "/search?category=handicrafts",
    image: unsplash("photo-1720905412121-eb010cd15955", "A hand-woven woollen shawl", 1000, 700),
    tone: "from-[#1d1206]/85 via-[#1d1206]/45",
  },
];

/**
 * Editorial banners that glide past like a news ticker. Hover or focus
 * stops them; people who prefer less motion get a plain
 * swipeable row instead.
 */
export function PromoBanners() {
  const n = banners.length;

  return (
    <section aria-label="Featured collections" aria-roledescription="carousel" className="shell pt-5 md:pt-6">
      <div className="group/ticker relative">
        <div className="-mx-4 overflow-hidden sm:mx-0 sm:rounded-xl sm:[mask-image:linear-gradient(to_right,transparent,#000_2%,#000_98%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
          <ul
            className="flex w-max animate-marquee group-hover/ticker:[animation-play-state:paused] group-focus-within/ticker:[animation-play-state:paused] motion-reduce:animate-none"
          >
            {[...banners, ...banners].map((b, i) => {
              const copy = i >= n; // second copy only makes the loop seamless
              return (
                <li
                  key={`${b.href}-${i}`}
                  aria-hidden={copy || undefined}
                  className={cn("w-[308px] shrink-0 pr-3 sm:w-[380px] md:pr-4 lg:w-[440px]", copy && "motion-reduce:hidden")}
                >
                  <Link
                    href={b.href}
                    tabIndex={copy ? -1 : undefined}
                    className="on-dark group relative isolate flex h-[178px] flex-col justify-end overflow-hidden rounded-[22px] bg-deep p-5 text-white md:h-[210px] md:rounded-xl lg:h-[230px] lg:p-6"
                  >
                    <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                      <Photo media={b.image} priority={i === 0} sizes="(min-width: 1024px) 440px, (min-width: 640px) 380px, 300px" fallback={null} />
                    </div>
                    <div className={cn("absolute inset-0 -z-10 bg-gradient-to-r to-transparent", b.tone)} />
                    <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold-soft">{b.kicker}</p>
                    <h3 className="mt-1.5 max-w-[18ch] text-[20px] font-bold leading-[1.15] tracking-[-0.02em] lg:text-[24px]">{b.title}</h3>
                    <p className="mt-1 max-w-[30ch] text-[13px] text-white/80">{b.sub}</p>
                    <span className="mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-ink transition-colors group-hover:bg-gold-soft md:px-3.5 md:py-1.5">
                      {b.cta}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

      </div>
    </section>
  );
}
