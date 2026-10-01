import Link from "next/link";
import { BadgeCheck, Smartphone, Truck } from "lucide-react";

const items = [
  { Icon: Truck, title: "Delivery from verified shops", sub: "Dry fruits, honey, crafts & more", href: "/search?delivery=1" },
  { Icon: BadgeCheck, title: "Sellers you can trust", sub: "Phone & ID checked", href: "/help/safety" },
  { Icon: Smartphone, title: "Post an ad in 2 minutes", sub: "Free for everyone in GB", href: "/sell" },
];

/** Thin promo strip above the header — three useful promises, not slogans. */
export function AnnouncementBar() {
  return (
    <div className="bg-forest text-white print:hidden max-md:hidden">
      <ul className="shell grid h-10 grid-cols-1 items-center md:grid-cols-3">
        {items.map(({ Icon, title, sub, href }, i) => (
          <li key={title} className={i > 0 ? "hidden md:block" : undefined}>
            <Link
              href={href}
              className={`flex items-center justify-center gap-2.5 whitespace-nowrap leading-tight hover:opacity-90 ${i > 0 ? "md:border-l md:border-white/10" : ""}`}
            >
              <Icon className="size-4 shrink-0 text-gold-soft" strokeWidth={1.9} aria-hidden />
              <span className="text-[12.5px]">
                <span className="font-semibold text-white">{title}</span>
                <span className="hidden text-white/60 min-[1440px]:inline"> · {sub}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
