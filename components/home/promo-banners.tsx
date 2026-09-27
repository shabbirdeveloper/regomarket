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
    image: unsplash("photo-1583440772344-edd2e043742c", "A dry fruit stall piled with apricots and nuts", 1600, 900),
    tone: "from-[#1d1206]/85 via-[#1d1206]/45",
  },
  {
    kicker: "Delivered to your door",
    title: "Verified shops that deliver",
    sub: "Honey, crafts and more, anywhere in GB",
    cta: "See shops",
    href: "/search?delivery=true",
    image: unsplash("photo-1587049352851-8d4e89133924", "Jars of raw mountain honey", 1000, 800),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
  {
    kicker: "Maal maweshi",
    title: "Goats, sheep & yaks",
    sub: "From herders in Astore and Skardu",
    cta: "Browse livestock",
    href: "/search?category=livestock",
    image: unsplash("photo-1704571166240-a9a811a87ca3", "Goats grazing on a mountain pasture", 1000, 800),
    tone: "from-[#0c1a14]/85 via-[#0c1a14]/40",
  },
];

/** Three editorial banners above the feed — real photos, one clear action each. */
export function PromoBanners() {
  return (
    <section aria-label="Featured collections" className="shell pt-5 md:pt-6">
      <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 md:grid md:grid-cols-[1.45fr_1fr_1fr] md:gap-4 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {banners.map((b, i) => (
          <li key={b.href} className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto">
            <Link
              href={b.href}
              className="on-dark group relative isolate flex h-[190px] flex-col justify-end overflow-hidden rounded-xl bg-deep p-5 text-white md:h-[210px] lg:h-[230px] lg:p-6"
            >
              <div className="absolute inset-0 -z-10 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                <Photo media={b.image} priority={i === 0} sizes={i === 0 ? "(min-width: 768px) 42vw, 85vw" : "(min-width: 768px) 29vw, 85vw"} fallback={null} />
              </div>
              <div className={cn("absolute inset-0 -z-10 bg-gradient-to-r to-transparent", b.tone)} />
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-gold-soft">{b.kicker}</p>
              <h3 className={cn("mt-1.5 max-w-[18ch] font-bold leading-[1.15] tracking-[-0.02em]", i === 0 ? "text-[22px] lg:text-[28px]" : "text-[19px] lg:text-[21px]")}>
                {b.title}
              </h3>
              <p className="mt-1 max-w-[30ch] text-[13px] text-white/80">{b.sub}</p>
              <span className="mt-3.5 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-semibold text-ink transition-colors group-hover:bg-gold-soft">
                {b.cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
