import Link from "next/link";
import { Bell, MessageSquare, Plus, Search, UserRound } from "lucide-react";
import { getBazaars, getCategories } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";
import { SavedLink } from "./saved-link";
import { headerCountCls, headerIconCls } from "./header-styles";

/** Compact sticky header: logo · primary nav · icon actions · one CTA */
export async function Header() {
  const [categories, bazaars] = await Promise.all([getCategories(), getBazaars()]);
  const navBazaars = bazaars.map((b) => ({ slug: b.slug, name: b.name, district: districtBySlug[b.district].name }));

  return (
    <header className="site-header sticky top-0 z-50 border-b border-line bg-paper">
      <div className="shell flex h-16 items-center gap-6 lg:h-[72px]">
        <Logo />

        <MainNav categories={categories} bazaars={navBazaars} />

        <div className="ml-auto flex items-center gap-0.5 lg:gap-1">
          <Link href="/search" data-tip="Search" className={headerIconCls}>
            <Search className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="sr-only">Search</span>
          </Link>
          <SavedLink className="hidden md:grid" />
          <Link href="/messages" data-tip="Messages" className={cn(headerIconCls, "hidden md:grid")}>
            <MessageSquare className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="sr-only">Messages, 2 unread</span>
            <span aria-hidden className={cn(headerCountCls, "bg-mountain text-white")}>
              2
            </span>
          </Link>
          <Link href="/notifications" data-tip="Notifications" className={headerIconCls}>
            <Bell className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="sr-only">Notifications, new</span>
            <span aria-hidden className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gold ring-2 ring-paper" />
          </Link>
          <Link href="/dashboard" data-tip="Account" className={cn(headerIconCls, "hidden md:grid")}>
            <span className="grid size-8 place-items-center rounded-full border border-line bg-stone text-ink/80">
              <UserRound className="size-[18px]" strokeWidth={1.75} aria-hidden />
            </span>
            <span className="sr-only">My account</span>
          </Link>

          <Link
            href="/sell"
            className={cn(buttonVariants({ variant: "premium", size: "md" }), "ml-2 hidden h-10 px-4 sm:inline-flex lg:ml-3")}
          >
            <Plus strokeWidth={2.2} aria-hidden />
            Sell<span className="-ml-1 hidden lg:inline"> / Create Shop</span>
          </Link>

          <MobileMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
