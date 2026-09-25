"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Category } from "@/types";
import { mainNav, routes } from "@/lib/site";
import { CategoryIcon } from "@/components/common/category-icon";
import { cn } from "@/lib/utils";

export interface NavBazaar {
  slug: string;
  name: string;
  district: string;
}

const linkCls = (active: boolean) =>
  cn(
    "relative inline-flex h-[72px] items-center gap-1 whitespace-nowrap px-3 text-[14px] font-medium transition-colors",
    active ? "text-mountain" : "text-ink/75 hover:text-ink",
    // animated underline sitting on the header's bottom border
    "after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:origin-left after:bg-mountain after:transition-transform after:duration-300",
    active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
  );

/** Hover / keyboard-focus dropdown — pure CSS, no JS state */
function Dropdown({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "invisible absolute left-0 top-full z-50 pt-1 opacity-0 transition-[opacity,transform] duration-200",
        "translate-y-1 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
        "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
      )}
    >
      <div className={cn("rounded-lg border border-line bg-paper p-2 shadow-lift", wide ? "w-[500px]" : "w-[280px]")}>
        {children}
      </div>
    </div>
  );
}

export function MainNav({ categories, bazaars }: { categories: Category[]; bazaars: NavBazaar[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav aria-label="Main" className="hidden self-stretch xl:block">
      <ul className="flex h-full items-center">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          const hasMenu = item.href === "/search" || item.href === "/bazaar";

          return (
            <li key={item.href} className={cn(hasMenu && "group relative")}>
              <Link href={item.href} aria-current={active ? "page" : undefined} className={linkCls(active)}>
                {item.label}
                {hasMenu && (
                  <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" aria-hidden />
                )}
              </Link>

              {item.href === "/search" && (
                <Dropdown wide>
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Browse categories</p>
                  <ul className="grid grid-cols-2">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={routes.search({ category: c.slug })}
                          className="flex items-center gap-3 rounded-md px-3 py-2 text-[14px] text-ink hover:bg-cream hover:text-mountain"
                        >
                          <CategoryIcon icon={c.icon} size={18} strokeWidth={1.75} className="shrink-0 text-mountain" />
                          <span className="min-w-0 flex-1 truncate">{c.shortName}</span>
                          <span className="tabular text-[12px] text-muted">{c.activeListings.toLocaleString("en-US")}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/search"
                    className="mt-1 flex items-center justify-between rounded-md border-t border-line px-3 pb-2 pt-3 text-[13.5px] font-semibold text-mountain"
                  >
                    Explore all listings <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Dropdown>
              )}

              {item.href === "/bazaar" && (
                <Dropdown>
                  <ul>
                    {bazaars.map((b) => (
                      <li key={b.slug}>
                        <Link
                          href={routes.bazaar(b.slug)}
                          className="flex items-center justify-between rounded-md px-3 py-2.5 text-[14px] text-ink hover:bg-cream hover:text-mountain"
                        >
                          <span className="font-medium">{b.name}</span>
                          <span className="text-[12px] text-muted">{b.district}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Dropdown>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
