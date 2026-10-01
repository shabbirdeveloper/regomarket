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
 * Phones: a floating tab dock. One green pill glides to the current tab;
 * Sell stays outlined so it is always findable. Ad pages hide the dock and
 * show their own buy bar instead.
 */
export function MobileNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/listing/")) return null;
  const current = items.findIndex(({ href }) => (href === "/" ? pathname === "/" : pathname.startsWith(href)));

  return (
    <nav
      aria-label="Quick navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] md:hidden print:hidden"
    >
      <div className="pointer-events-auto relative mx-auto h-[66px] max-w-md rounded-[24px] bg-white/95 px-1.5 shadow-dock ring-1 ring-ink/[0.06] backdrop-blur-md">
        {/* The gliding pill */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0 left-1.5 flex w-[calc((100%-12px)/5)] items-center justify-center transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.5,1)]",
            current < 0 && "opacity-0",
          )}
          style={{ transform: `translateX(${Math.max(current, 0) * 100}%)` }}
        >
          <span className="h-11 w-[54px] rounded-[16px] bg-mountain shadow-[0_8px_18px_-8px_rgb(6_78_59/0.7)]" />
        </span>

        <ul className="relative grid h-full grid-cols-5 items-center">
          {items.map(({ href, label, Icon, sell }, i) => {
            const active = i === current;
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "grid h-11 w-[54px] place-items-center rounded-[16px] transition-[color,box-shadow,transform] duration-300 active:scale-90",
                    active ? "text-white" : sell ? "text-mountain ring-[1.5px] ring-inset ring-mountain/70" : "text-ink/55",
                  )}
                >
                  <Icon
                    key={active ? "on" : "off"}
                    className={cn("size-[22px]", active && "animate-dock-pop")}
                    strokeWidth={active || sell ? 2.1 : 1.8}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
