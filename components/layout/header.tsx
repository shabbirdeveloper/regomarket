import Link from "next/link";
import { Suspense } from "react";
import { Bell, MessageSquareText, Plus, Search, UserRound } from "lucide-react";
import { previewUser } from "@/lib/site";
import { getBazaars, getCategories } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { cn } from "@/lib/utils";
import { HeaderQueryInput } from "./header-query-input";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";
import { SavedLink } from "./saved-link";
import { headerCountCls, headerIconCls } from "./header-styles";

const searchInputCls =
  "h-11 w-full rounded-full border border-line-strong bg-cream pl-5 pr-14 text-[14.5px] text-ink outline-none transition-[border-color,background-color,box-shadow] placeholder:text-muted hover:border-ink/30 focus:border-mountain focus:bg-white focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

/** The search that lives in the header on every page — a plain GET to /search. */
function HeaderSearch({ id, className }: { id: string; className?: string }) {
  const input = {
    id,
    name: "q",
    type: "search",
    autoComplete: "off",
    enterKeyHint: "search" as const,
    placeholder: "Search khubani, goats, land, phones…",
    className: searchInputCls,
  };
  return (
    <form action="/search" method="get" role="search" aria-label="Search REGOMARKET" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Search ads
      </label>
      {/* Shows the current words on /search; plain input while params load */}
      <Suspense fallback={<input {...input} />}>
        <HeaderQueryInput {...input} />
      </Suspense>
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 grid h-9 w-11 place-items-center rounded-full bg-mountain text-white transition-colors hover:bg-mountain-hover"
      >
        <Search className="size-[18px]" strokeWidth={2.4} aria-hidden />
      </button>
    </form>
  );
}

/** Marketplace header: logo · short nav · big search · account · icons · Sell */
export async function Header() {
  const [categories, bazaars] = await Promise.all([getCategories(), getBazaars()]);
  const navBazaars = bazaars.map((b) => ({ slug: b.slug, name: b.name, district: districtBySlug[b.district].name }));

  const user = previewUser;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-line bg-white">
      <div className="shell flex h-16 items-center gap-4 lg:h-[72px] lg:gap-5">
        <Logo />

        <MainNav categories={categories} bazaars={navBazaars} />

        <HeaderSearch id="header-q" className="hidden min-w-[240px] flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 lg:gap-1">
          <Link
            href="/dashboard"
            className="mr-1 hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-cream min-[1680px]:flex"
          >
            <span className="grid size-8 place-items-center rounded-full bg-mint text-[12px] font-semibold text-mountain">
              {user.initials}
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] text-muted">Hi, {user.name}</span>
              <span className="block text-[13px] font-semibold text-ink">My ads & account</span>
            </span>
          </Link>
          <Link href="/dashboard" data-tip="My account" className={cn(headerIconCls, "hidden md:grid min-[1680px]:hidden")}>
            <UserRound className="size-[21px]" strokeWidth={1.8} aria-hidden />
            <span className="sr-only">My account</span>
          </Link>

          <SavedLink className="hidden md:grid" />
          <Link href="/messages" data-tip="Messages" className={cn(headerIconCls, "hidden md:grid")}>
            <MessageSquareText className="size-[21px]" strokeWidth={1.8} aria-hidden />
            <span className="sr-only">Messages, {user.unreadMessages} unread</span>
            <span aria-hidden className={headerCountCls}>
              {user.unreadMessages}
            </span>
          </Link>
          <Link href="/notifications" data-tip="Notifications" className={headerIconCls}>
            <Bell className="size-[21px]" strokeWidth={1.8} aria-hidden />
            <span className="sr-only">Notifications, {user.unreadNotifications} new</span>
            <span aria-hidden className={headerCountCls}>
              {user.unreadNotifications}
            </span>
          </Link>

          <Link
            href="/sell"
            className="ml-2 hidden h-10 items-center gap-1.5 rounded-full bg-mountain px-4 text-[14px] font-semibold text-white transition-colors hover:bg-mountain-hover sm:inline-flex"
          >
            <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden />
            Sell
          </Link>

          <MobileMenu categories={categories} />
        </div>
      </div>
      {/* Phones: search gets its own full-width row */}
      <div className="shell pb-3 md:hidden">
        <HeaderSearch id="header-q-m" />
      </div>
    </header>
  );
}
