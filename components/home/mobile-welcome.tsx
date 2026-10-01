import { MobileSearch } from "@/components/layout/mobile-search";

/**
 * Phones: the app-style opening — one plain line saying what this is, then
 * search. Larger screens keep the header search, so the line is for screen
 * readers only there.
 */
export function MobileWelcome() {
  return (
    <section aria-labelledby="home-title" className="shell pt-1 md:pt-0">
      <h1
        id="home-title"
        className="max-w-[17ch] text-[27px] font-semibold leading-[1.15] tracking-[-0.025em] text-ink md:sr-only"
      >
        Buy and sell anything in Gilgit-Baltistan
      </h1>
      <MobileSearch id="home-q" className="mt-4 md:hidden" />
    </section>
  );
}
