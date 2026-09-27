"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ShopTab {
  id: string;
  label: string;
  count?: number;
}

/**
 * Sticky tab bar for the shop page. All panels are server-rendered (good for
 * search engines); the inactive ones are just hidden. The tab lives in the
 * URL hash so "…/shop/x#reviews" links straight to reviews.
 */
export function ShopTabs({ tabs, panels, aside }: { tabs: ShopTab[]; panels: ReactNode[]; aside?: ReactNode }) {
  const [active, setActive] = useState(tabs[0].id);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === h)) setActive(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [tabs]);

  const select = (id: string) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    const bar = barRef.current;
    if (bar) {
      const stickTop = parseFloat(getComputedStyle(bar).top) || 0;
      const y = bar.getBoundingClientRect().top + window.scrollY - stickTop;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    select(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <>
      <div
        ref={barRef}
        className="sticky top-[120px] z-30 md:top-16 -mx-4 border-b border-line bg-white/95 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[72px] lg:mx-0 lg:px-0"
      >
        <div className="flex items-center justify-between gap-4">
          <div role="tablist" aria-label="Shop sections" className="no-scrollbar -mb-px flex gap-6 overflow-x-auto md:gap-8">
            {tabs.map((t, i) => {
              const on = t.id === active;
              return (
                <button
                  key={t.id}
                  id={`tab-${t.id}`}
                  role="tab"
                  type="button"
                  aria-selected={on}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(t.id)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "relative flex h-14 shrink-0 items-center gap-1.5 whitespace-nowrap text-[15px] font-semibold transition-colors",
                    on ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {t.label}
                  {t.count !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-px text-[11.5px] font-semibold tabular-nums",
                        on ? "bg-ink text-white" : "bg-stone text-ink/70",
                      )}
                    >
                      {t.count}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-mountain transition-transform duration-300",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              );
            })}
          </div>
          {aside && <div className="hidden shrink-0 md:block">{aside}</div>}
        </div>
      </div>

      {tabs.map((t, i) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={t.id !== active}
          className="pt-6 md:pt-8"
        >
          {panels[i]}
        </div>
      ))}
    </>
  );
}
