import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ArtSpec, Media } from "@/types";
import { Photo } from "@/components/media/photo";
import { LandscapeArt } from "@/components/media/landscape-art";
import { MountainMark } from "@/components/common/ornaments";

interface Banner {
  title: string;
  text: string;
  cta: string;
  href: string;
  image: Media;
  art: ArtSpec;
}

/** Wide editorial banner: dark-green text panel on the left, photo on the right */
function BannerCard({ b }: { b: Banner }) {
  return (
    <Link
      href={b.href}
      className="on-dark group relative isolate flex h-[168px] flex-col justify-center overflow-hidden rounded-xl bg-forest px-6 text-white shadow-card sm:h-[176px] xl:h-[160px] 2xl:h-[172px] 2xl:px-8"
    >
      <div className="absolute inset-y-0 right-0 -z-10 w-[72%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]">
        <Photo
          media={b.image}
          sizes="(min-width: 1024px) 24vw, 70vw"
          fallback={<LandscapeArt art={b.art} label={b.image.alt} />}
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest from-30% via-forest/75 via-55% to-forest/0" />

      <MountainMark className="absolute right-4 top-3 h-5 w-11 text-gold-soft/80" />
      <MountainMark className="absolute bottom-3 right-5 h-4 w-9 text-gold-soft/60" />

      <h3 className="max-w-[16ch] font-serif text-[24px] font-bold leading-[1.08] 2xl:text-[27px]">{b.title}</h3>
      <p className="mt-1.5 max-w-[24ch] text-[14.5px] leading-snug text-white/90 2xl:text-[15.5px]">{b.text}</p>
      <span className="mt-3.5 inline-flex h-9 w-fit items-center gap-2 rounded-md bg-gradient-to-b from-[#F4DC97] to-[#DDB25B] px-4 text-[14.5px] font-semibold text-deep shadow-[0_4px_12px_-6px_rgb(0_0_0/0.5)] transition-[filter] group-hover:brightness-105">
        {b.cta}
        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
      </span>
      <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 transition-colors group-hover:ring-gold/60" />
    </Link>
  );
}

export function MarketBanners({ images }: { images: { dryFruits: Media; livestock: Media; shops: Media } }) {
  const banners: Banner[] = [
    {
      title: "Fresh Dry Fruits From GB",
      text: "Premium quality, directly from local farmers",
      cta: "View Products",
      href: "/search?category=dry-fruits",
      image: images.dryFruits,
      art: { seed: 5, palette: "apricot", motif: "apricots" },
    },
    {
      title: "Livestock Market",
      text: "Buy or Sell Easily in Gilgit-Baltistan",
      cta: "Browse Livestock",
      href: "/search?category=livestock",
      image: images.livestock,
      art: { seed: 19, palette: "alpine", motif: "meadow" },
    },
    {
      title: "Local Shops",
      text: "Verified GB Businesses",
      cta: "Explore Shops",
      href: "/shops",
      image: images.shops,
      art: { seed: 29, palette: "dusk", motif: "arches" },
    },
  ];

  return (
    <section aria-label="Markets" className="shell pt-2 lg:pt-1">
      <ul className="rail -mx-4 gap-3 px-4 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 2xl:gap-5">
        {banners.map((b) => (
          <li key={b.href} className="w-[86%] shrink-0 xs:w-[80%] sm:w-[58%] md:w-[48%] lg:w-auto">
            <BannerCard b={b} />
          </li>
        ))}
      </ul>
    </section>
  );
}
