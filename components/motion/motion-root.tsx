"use client";

import { useEffect, type CSSProperties } from "react";

/**
 * Site-wide motion, mounted once in SiteShell:
 * - [data-reveal]: anything below the fold rises into place when scrolled to
 *   (and anything added later, e.g. "See more ads", animates in). Content
 *   already on screen at load is never hidden, so nothing flashes.
 * - [data-spotlight]: feeds the cursor position to the card's gold edge light.
 */
export function MotionRoot() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Spotlight (mouse only)
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.<HTMLElement>("[data-spotlight]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });

    if (reduce || !("IntersectionObserver" in window)) {
      return () => document.removeEventListener("pointermove", onMove);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "shown";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    const arm = (el: HTMLElement, fresh: boolean) => {
      const state = el.dataset.reveal;
      if (state === "shown" || state === "pending") return;
      if (!fresh && el.getBoundingClientRect().top < window.innerHeight * 0.94) {
        el.dataset.reveal = "shown";
        return;
      }
      el.dataset.reveal = "pending";
      void el.offsetWidth; // commit the hidden state so the rise animates
      io.observe(el);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => arm(el, false));

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.matches("[data-reveal]")) arm(n, true);
          n.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => arm(el, true));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}

/** Stagger index for [data-reveal] items: `style={stagger(i)}` */
export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;
