import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Brand mark: a Karakoram skyline drawn in one confident line — two peaks,
 * the taller one carrying a gold snow ridge.
 */
export function MountainLogoMark({ dark, className }: { dark?: boolean; className?: string }) {
  const ink = dark ? "#FFFFFF" : "#064E3B";
  return (
    <svg viewBox="0 0 52 32" aria-hidden className={cn("h-8 w-[52px] shrink-0", className)} fill="none">
      <path
        d="M2 29 L17 9.5 L24.5 18.5 L32.5 5 L50 29"
        stroke={ink}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M27.4 13.6 L32.5 5 L37.2 12.9 L34.3 11.4 L32.4 13.5 L30.2 11.6 Z" fill="#C79A42" />
      <path d="M11 29 L17 21 L21 26" stroke={ink} strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compact square mark (favicon, avatars, app icon) */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10", className)} aria-hidden>
      <rect width="40" height="40" rx="9" fill="#064E3B" />
      <path d="M6 29 L15.5 16.5 L20 22 L25.5 12.5 L34 29" fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22.9 17 L25.5 12.5 L28 16.7 L26.4 15.9 L25.4 17 L24.2 16 Z" fill="#E3C27E" />
    </svg>
  );
}

export function Logo({
  tone = "light",
  showTagline = true,
  className,
}: {
  tone?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5", className)} aria-label="REGOMARKET — home">
      <MountainLogoMark dark={dark} className="h-7 w-[46px] sm:h-8 sm:w-[52px]" />
      <span className="flex flex-col leading-none">
        <span className="whitespace-nowrap font-sans text-[20px] font-bold tracking-[-0.02em] sm:text-[22px] lg:text-[24px]">
          <span className={dark ? "text-white" : "text-mountain"}>REGO</span>
          <span className={cn("ml-[0.12em]", dark ? "text-gold-soft" : "text-gold")}>MARKET</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.16em] sm:block",
              dark ? "text-white/65" : "text-ink/70",
            )}
          >
            Gilgit-Baltistan Marketplace
          </span>
        )}
      </span>
    </Link>
  );
}
