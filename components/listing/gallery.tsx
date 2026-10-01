"use client";

import Image from "next/image";
import { useState, type MouseEvent, type ReactNode } from "react";
import type { Media } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Listing photos: vertical thumbnails on desktop, swipe + dots on phones,
 * and a hover zoom that follows the cursor (desktop only).
 */
export function Gallery({ images, title, children }: { images: Media[]; title: string; children?: ReactNode }) {
  const pics = images.filter((m) => m.src);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const current = pics[index];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div className="flex gap-3">
      {pics.length > 1 && (
        <ul className="hidden w-[72px] shrink-0 flex-col gap-2.5 md:flex" aria-label="Photos">
          {pics.map((m, i) => (
            <li key={m.src! + i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                onMouseEnter={() => setIndex(i)}
                aria-label={`Photo ${i + 1} of ${pics.length}`}
                aria-current={i === index}
                className={cn(
                  "relative block aspect-square w-full overflow-hidden rounded-lg bg-stone ring-offset-2 transition",
                  i === index ? "ring-2 ring-ink" : "opacity-75 hover:opacity-100",
                )}
              >
                <Image src={m.src!} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative min-w-0 flex-1">
        <div
          className="relative aspect-square overflow-hidden rounded-[24px] bg-[#f3f1ec] md:cursor-zoom-in md:rounded-2xl"
          onMouseMove={onMove}
          onMouseLeave={() => setZoom(null)}
        >
          {current && (
            <Image
              key={current.src}
              src={current.src!}
              alt={current.alt || title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-200 ease-out"
              style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          )}
          {children}
        </div>

        {pics.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5 md:hidden">
            {pics.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Photo ${i + 1}`}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-ink" : "w-1.5 bg-line-strong")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
