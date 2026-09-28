"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** One data hue for every admin chart (validated: lightness, chroma, 3:1 on white). */
export const SERIES = "#0e8a62";
const GRID = "#ece8df";
const AXIS_TEXT = "#6b716c";

const nf = new Intl.NumberFormat("en-US");

/* ---------- Sparkline (stat tiles) ---------- */

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 120;
  const h = 32;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const x = (i: number) => (i / Math.max(1, values.length - 1)) * (w - 4) + 2;
  const y = (v: number) => h - 3 - ((v - min) / Math.max(1, max - min)) * (h - 6);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-8 w-[120px]", className)} aria-hidden>
      <path d={d} fill="none" stroke="#b9c7bf" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r="3.5" fill={SERIES} stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

/* ---------- Trend (area + line, crosshair tooltip) ---------- */

function niceMax(v: number) {
  if (v <= 5) return 5;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
}

export function TrendChart({ points, label }: { points: { date: string; value: number }[]; label: string }) {
  const W = 720;
  const H = 240;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = niceMax(Math.max(...points.map((p) => p.value), 1));
  const ticks = [0, max / 2, max];
  const x = (i: number) => pad.l + (i / Math.max(1, points.length - 1)) * iw;
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${pad.t + ih} L${pad.l},${pad.t + ih} Z`;
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const id = useId();

  const fmtDay = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const total = points.reduce((n, p) => n + p.value, 0);

  const onMove = (clientX: number) => {
    const r = svg.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((clientX - r.left) / r.width) * W;
    const i = Math.round(((px - pad.l) / iw) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };

  const h = hover !== null ? points[hover] : null;
  const tipLeft = hover !== null ? (x(hover) / W) * 100 : 0;

  return (
    <figure className="relative">
      <figcaption className="sr-only">
        {label}: {nf.format(total)} in {points.length} days
      </figcaption>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-labelledby={`${id}-t`}
        onPointerMove={(e) => onMove(e.clientX)}
        onPointerDown={(e) => onMove(e.clientX)}
        onPointerLeave={() => setHover(null)}
      >
        <title id={`${id}-t`}>{label}, last {points.length} days</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
              {nf.format(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % 7 === (points.length - 1) % 7 ? (
            <text key={p.date} x={x(i)} y={H - 8} textAnchor={i === points.length - 1 ? "end" : "middle"} fontSize="11" fill={AXIS_TEXT}>
              {fmtDay(p.date)}
            </text>
          ) : null,
        )}
        <path d={area} fill={SERIES} fillOpacity="0.1" />
        <path d={line} fill="none" stroke={SERIES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + ih} stroke="#9aa39d" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(points[hover].value)} r="5" fill={SERIES} stroke="#fff" strokeWidth="2" />
          </>
        )}
        {hover === null && <circle cx={x(points.length - 1)} cy={y(points[points.length - 1].value)} r="4.5" fill={SERIES} stroke="#fff" strokeWidth="2" />}
      </svg>
      {h && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-[#0f1a15] px-3 py-2 text-white shadow-lg"
          style={{ left: `clamp(60px, ${tipLeft}%, calc(100% - 60px))` }}
        >
          <p className="text-[15px] font-bold tabular-nums leading-none">{nf.format(h.value)}</p>
          <p className="mt-1 text-[11.5px] text-white/70">
            {label} · {fmtDay(h.date)}
          </p>
        </div>
      )}
    </figure>
  );
}

/* ---------- Ranked horizontal bars ---------- */

export function BarList({ items, max: maxProp }: { items: { key: string; label: string; value: number; href?: string }[]; max?: number }) {
  const max = maxProp ?? Math.max(...items.map((i) => i.value), 1);
  const rows = useMemo(() => items, [items]);
  return (
    <ul className="space-y-2.5">
      {rows.map((it) => {
        const pct = Math.max(2, (it.value / max) * 100);
        const inner = (
          <>
            <span className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="truncate text-ink/85">{it.label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">{nf.format(it.value)}</span>
            </span>
            <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[#f1eee6]">
              <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: SERIES }} />
            </span>
          </>
        );
        return (
          <li key={it.key}>
            {it.href ? (
              <Link href={it.href} className="block rounded-md outline-offset-4 hover:opacity-80" title={`${it.label}: ${nf.format(it.value)}`}>
                {inner}
              </Link>
            ) : (
              <div title={`${it.label}: ${nf.format(it.value)}`}>{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
