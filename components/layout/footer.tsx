import Link from "next/link";
import { ArrowUp, MapPin } from "lucide-react";
import { footerNav, site } from "@/lib/site";
import { getDistricts } from "@/lib/data";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/common/brand-icons";
import { Logo } from "./logo";

/** Plain, useful footer: brand, four link columns, districts, legal. */
export async function Footer() {
  const districts = await getDistricts();
  const socials = [
    { href: site.social.facebook, label: "REGOMARKET on Facebook", Icon: FacebookIcon },
    { href: site.social.instagram, label: "REGOMARKET on Instagram", Icon: InstagramIcon },
    { href: site.social.youtube, label: "REGOMARKET on YouTube", Icon: YouTubeIcon },
  ];

  return (
    <footer className="on-dark bg-forest text-white/75">
      
      <div className="shell relative pb-10 pt-12 lg:pt-16">
        {/* Brand + links */}
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2.75fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo tone="dark" />
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/65">
              Gilgit-Baltistan&apos;s local marketplace for buying, selling and supporting local businesses.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-white/60">
              <MapPin className="size-3.5 text-gold-soft" aria-hidden />
              Serving all {districts.length} districts of GB
            </p>
            <ul className="mt-6 flex gap-2.5">
              {socials.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-md border border-white/15 text-white/75 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {footerNav.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="eyebrow text-gold-soft">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="group inline-flex items-center gap-1.5 text-[14px] text-white/70 transition-colors hover:text-white"
                      >
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
        <nav aria-label="Browse by district" className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 md:flex-row md:items-center md:gap-5">
          <p className="shrink-0 text-[13px] font-medium text-white/80">Browse by district</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {districts.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/search?district=${d.slug}`}
                  className="text-[13px] text-white/65 underline-offset-4 hover:text-white hover:underline"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 pb-28 pt-5 text-[13px] text-white/55 md:flex-row md:items-center md:justify-between md:pb-5">
          <p>© 2026 REGOMARKET · Made in Gilgit-Baltistan</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/help/safety" className="hover:text-white">
              Safety
            </Link>
            <a
              href="#top"
              className="group inline-flex items-center gap-1 text-white/70 hover:text-white"
            >
              Back to top
              <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
