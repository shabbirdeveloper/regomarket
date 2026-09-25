"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Heart, LayoutDashboard, Menu, MessageSquare, Plus, Store, X } from "lucide-react";
import type { Category } from "@/types";
import { mainNav } from "@/lib/site";
import { CategoryIcon } from "@/components/common/category-icon";
import { Logo } from "./logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Slide-in menu for < 1280px. Built on native <dialog> for free focus
 * trapping, Esc-to-close and inert background.
 */
export function MobileMenu({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close when navigating
  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="grid size-10 place-items-center rounded-md text-ink transition-colors hover:bg-stone xl:hidden"
        aria-haspopup="dialog"
      >
        <Menu className="size-[22px]" strokeWidth={1.7} aria-hidden />
        <span className="sr-only">Open menu</span>
      </button>

      <dialog
        ref={ref}
        aria-label="Menu"
        onClick={(e) => {
          if (e.target === ref.current) close();
        }}
        className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-dvh w-[min(88vw,380px)] max-w-none bg-paper p-0 text-ink shadow-float open:animate-fade-in backdrop:bg-deep/45"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <Logo showTagline={false} />
            <button
              type="button"
              onClick={close}
              className="grid size-10 place-items-center rounded-md hover:bg-stone"
            >
              <X className="size-5" aria-hidden />
              <span className="sr-only">Close menu</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/sell" className={cn(buttonVariants({ variant: "primary", size: "md" }), "w-full")}>
                <Plus aria-hidden /> Post Free Ad
              </Link>
              <Link href="/create-shop" className={cn(buttonVariants({ variant: "gold", size: "md" }), "w-full")}>
                <Store aria-hidden /> Create Shop
              </Link>
            </div>

            <nav aria-label="Mobile" className="mt-6">
              <ul className="divide-y divide-line border-y border-line">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex h-12 items-center justify-between text-[15px] font-medium text-ink hover:text-mountain"
                    >
                      {item.label}
                      <ChevronRight className="size-4 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <p className="eyebrow mt-7 text-muted">Browse categories</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/search?category=${c.slug}`}
                    className="flex items-center gap-2.5 rounded-md border border-line px-3 py-2.5 text-[13px] font-medium hover:border-mountain/30 hover:bg-mint"
                  >
                    <CategoryIcon icon={c.icon} size={18} className="shrink-0 text-mountain" />
                    <span className="truncate">{c.shortName}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-7 text-muted">My account</p>
            <ul className="mt-2">
              {[
                { href: "/saved", label: "Saved listings", Icon: Heart },
                { href: "/messages", label: "Messages", Icon: MessageSquare },
                { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
              ].map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex h-11 items-center gap-3 text-[15px] hover:text-mountain">
                    <Icon className="size-[18px] text-muted" aria-hidden />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  );
}
