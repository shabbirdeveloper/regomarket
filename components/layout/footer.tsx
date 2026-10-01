import Link from "next/link";
import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { footerNav, site } from "@/lib/site";
import { getDistricts } from "@/lib/data";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/common/brand-icons";
import { Logo } from "./logo";

/** A quiet Karakoram skyline drawn in one line — the brand mark, stretched across the page. */
function Skyline() {
  return (
    <svg viewBox="0 0 1200 140" preserveAspectRatio="xMidYMax slice" className="block h-[90px] w-full md:h-[140px]" aria-hidden fill="none">
      <path
        d="M0 138 L120 92 L190 118 L300 56 L380 100 L470 70 L560 112 L660 30 L740 84 L820 60 L900 104 L1000 64 L1080 98 L1200 72"
        stroke="rgb(255 255 255 / 0.09)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M640 50 L660 30 L679 48 L670 45 L661 52 L651 46 Z" fill="rgb(227 194 126 / 0.35)" />
    </svg>
  );
}

/** Closing call to action, brand and contact, four link columns, districts, legal. */
export async function Footer() {
  const districts = await getDistricts();
  const socials = [
    { href: site.social.facebook, label: "Facebook", Icon: FacebookIcon },
    { href: site.social.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: site.social.youtube, label: "YouTube", Icon: YouTubeIcon },
  ];

  return (
    <footer className="on-dark bg-forest text-white">
      {/* Closing line */}
      <div className="shell pt-14 lg:pt-20">
        <div className="flex flex-col gap-7 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between lg:pb-16">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-gold-soft">From Hunza to Diamer</p>
            <h2 className="mt-3 max-w-[16ch] text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[46px]">
              Buy and sell with your own valley.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/sell" className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[14.5px] font-semibold text-forest transition-colors hover:bg-gold-soft">
              Post a free ad
            </Link>
            <Link
              href="/create-shop"
              className="inline-flex h-12 items-center gap-1.5 rounded-full border border-white/25 px-6 text-[14.5px] font-semibold text-white transition-colors hover:border-white/60"
            >
              Open a shop <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Brand + links */}
      <div className="shell grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1.2fr_2.8fr] lg:gap-16 lg:py-16">
        <div className="max-w-sm">
          <Logo tone="dark" />
          <p className="mt-5 text-[14.5px] leading-relaxed text-white/70">
            The local marketplace of Gilgit-Baltistan — dry fruits, livestock, land, vehicles and the shops of every bazaar, in one place.
          </p>
          <ul className="mt-6 space-y-2.5 text-[14px] text-white/70">
            <li>
              <a href="mailto:support@regomarket.pk" className="inline-flex items-center gap-2.5 hover:text-white">
                <Mail className="size-4 text-white/45" aria-hidden /> support@regomarket.pk
              </a>
            </li>
            <li className="inline-flex items-center gap-2.5">
              <MapPin className="size-4 text-white/45" aria-hidden /> Jutial, Gilgit
            </li>
          </ul>
          <ul className="mt-7 flex items-center gap-5">
            {socials.map(({ href, label, Icon }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`REGOMARKET on ${label}`} className="text-white/55 transition-colors hover:text-white">
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">{col.title}</p>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-[14.5px] text-white/80 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Districts */}
      <nav aria-label="Browse by district" className="shell">
        <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-white/45">Every district</p>
        <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2 text-[14px]">
          {districts.map((d, i) => (
            <li key={d.slug} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className="text-white/20">
                  /
                </span>
              )}
              <Link href={`/search?district=${d.slug}`} className="text-white/70 transition-colors hover:text-white">
                {d.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <Skyline />
      </div>

      {/* Legal */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 pb-28 pt-5 text-[13px] text-white/50 md:flex-row md:items-center md:justify-between md:pb-6">
          <p>© {new Date().getFullYear()} REGOMARKET · Made in Gilgit-Baltistan</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/help/safety" className="hover:text-white">
              Safety
            </Link>
            <a href="#top" className="group inline-flex items-center gap-1 text-white/70 hover:text-white">
              Back to top
              <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
