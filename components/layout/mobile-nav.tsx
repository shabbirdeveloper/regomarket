"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, MessageSquare, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Explore", Icon: Compass },
  { href: "/sell", label: "Sell — post a free ad", Icon: Plus, sell: true },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/dashboard", label: "My account", Icon: UserRound },
];

/**
 * Phones: a floating tab dock. The current tab sits in a solid green pill;
 * Sell is always outlined so it stays findable. Ad pages hide the dock and
 * show their own buy bar instead.
 */
export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/listing/")) return null;

  return (
    <nav
      aria-label="Quick navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] md:hidden print:hidden"
    >
      <ul className="pointer-events-auto mx-auto grid h-[66px] max-w-md grid-cols-5 items-center rounded-[24px] bg-white px-1.5 shadow-dock ring-1 ring-ink/[0.06]">
        {items.map(({ href, label, Icon, sell }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "grid h-11 w-[54px] place-items-center rounded-[16px] transition-colors active:scale-95",
                  active
                    ? "bg-mountain text-white"
                    : sell
                      ? "text-mountain ring-[1.5px] ring-inset ring-mountain/70"
                      : "text-ink/55 hover:text-ink",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active || sell ? 2.1 : 1.8} aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
