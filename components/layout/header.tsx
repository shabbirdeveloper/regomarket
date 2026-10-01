import Link from "next/link";
import { Suspense } from "react";
import { Plus, Search } from "lucide-react";
import { getBazaars, getCategories } from "@/lib/data";
import { districtBySlug } from "@/data/locations";
import { cn } from "@/lib/utils";
import { HeaderQueryInput } from "./header-query-input";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileMenu } from "./mobile-menu";
import { MobileSearchRow } from "./mobile-search";
import { SavedLink } from "./saved-link";
import { AccountChip, AccountIcon, CartLink, MessagesLink, NotificationsLink } from "./account-links";

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

  return (
    <header className="site-header sticky top-0 z-50 bg-white md:border-b md:border-line">
      <div className="shell flex h-16 items-center gap-4 lg:h-[72px] lg:gap-5">
        <Logo />

        <MainNav categories={categories} bazaars={navBazaars} />

        <HeaderSearch id="header-q" className="hidden min-w-[240px] flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 lg:gap-1">
          <AccountChip />
          <AccountIcon className="hidden md:grid min-[1680px]:hidden" />

          <SavedLink className="hidden md:grid" />
          <MessagesLink className="hidden md:grid" />
          <NotificationsLink />
          <CartLink />

          <Link
            href="/sell"
            className="shine press ml-2 hidden h-10 items-center gap-1.5 rounded-full bg-mountain px-4 text-[14px] font-semibold text-white transition-colors hover:bg-mountain-hover sm:inline-flex"
          >
            <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden />
            Sell
          </Link>

          <MobileMenu categories={categories} />
        </div>
      </div>
      {/* Phones: search gets its own full-width row (home draws it under the welcome line) */}
      <MobileSearchRow />
    </header>
  );
}
