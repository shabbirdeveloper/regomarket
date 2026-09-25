"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, House, MessageSquare, Plus, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", Icon: House },
  { href: "/search", label: "Explore", Icon: Compass },
  { href: "/sell", label: "Sell", Icon: Plus, primary: true },
  { href: "/messages", label: "Messages", Icon: MessageSquare },
  { href: "/dashboard", label: "Profile", Icon: UserRound },
];

/** Bottom tab bar for phones. SELL is the raised centre action. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map(({ href, label, Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          if (primary) {
            return (
              <li key={href} className="relative flex justify-center">
                <Link href={href} className="group -mt-6 flex flex-col items-center gap-1" aria-label="Sell — post a free ad">
                  <span className="grid size-14 place-items-center rounded-full bg-mountain text-white shadow-[0_10px_22px_-10px_rgb(4_56_44/0.7)] ring-4 ring-paper transition-transform group-active:scale-95">
                    <Icon className="size-6" strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mountain">Sell</span>
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-mountain" : "text-muted",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2 : 1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
