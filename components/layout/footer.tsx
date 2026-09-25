import { Fragment } from "react";
import Link from "next/link";
import { footerNav, site } from "@/lib/site";
import { getDistricts } from "@/lib/data";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/common/brand-icons";
import { RidgeLine } from "@/components/common/ornaments";
import { Logo } from "./logo";

export async function Footer() {
  const districts = await getDistricts();
  const socials = [
    { href: site.social.facebook, label: "REGOMARKET on Facebook", Icon: FacebookIcon },
    { href: site.social.instagram, label: "REGOMARKET on Instagram", Icon: InstagramIcon },
    { href: site.social.youtube, label: "REGOMARKET on YouTube", Icon: YouTubeIcon },
  ];

  return (
    <footer className="on-dark relative overflow-hidden bg-forest text-white/75">
      <RidgeLine className="pointer-events-none absolute inset-x-0 top-0 h-16 text-gold/15" />
      <div className="shell relative pb-28 pt-16 md:pb-10 lg:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2.7fr] lg:gap-16">
          <div className="max-w-sm">
            <Logo tone="dark" />
            <p className="mt-5 text-[14.5px] leading-relaxed text-white/65">
              Gilgit-Baltistan&apos;s local marketplace for buying, selling and supporting local businesses.
            </p>
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="grid size-10 place-items-center rounded-md border border-white/15 text-white/75 transition-colors hover:border-gold-soft/60 hover:text-gold-soft"
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
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[14px] text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6">
          <p className="text-[12.5px] leading-7 text-white/60">
            <span className="mr-2 text-white/75">Browse by district:</span>{" "}
            {districts.map((d, i) => (
              <Fragment key={d.slug}>
                <span className="whitespace-nowrap">
                  <Link href={`/search?district=${d.slug}`} className="hover:text-gold-soft">
                    {d.name}
                  </Link>
                  {i < districts.length - 1 && <span aria-hidden className="mx-2 text-white/25">·</span>}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-[13px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 REGOMARKET</p>
          <p>Gilgit-Baltistan, Pakistan</p>
        </div>
      </div>
    </footer>
  );
}
