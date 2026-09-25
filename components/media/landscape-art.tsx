import type { ArtPalette, ArtSpec } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Generated Karakoram-style landscape.
 *
 * Used wherever a real photograph has not been supplied yet (hero, banners,
 * districts, shop covers, bazaars). Deterministic per seed, so every district
 * or shop gets its own ridge line, and output is identical on server and client.
 * Pure SVG — no JavaScript, ~2–3 KB per instance.
 */

type Palette = {
  sky: [string, string, string];
  sun: string;
  layers: [string, string, string, string, string];
  snow: string;
  ground: string;
};

const PALETTES: Record<ArtPalette, Palette> = {
  dawn: {
    sky: ["#C9DAD1", "#E7E4D3", "#F3E2BD"],
    sun: "#F0CF86",
    layers: ["#B4C4B9", "#8EA597", "#628270", "#315B4A", "#0F3D2F"],
    snow: "#FBF8F0",
    ground: "#0B3A2C",
  },
  dusk: {
    sky: ["#244238", "#6F7F66", "#DCBB84"],
    sun: "#EFCB80",
    layers: ["#8D9A87", "#66786A", "#45594D", "#2A4036", "#132B22"],
    snow: "#EFE6D2",
    ground: "#0F261E",
  },
  meadow: {
    sky: ["#D3E3DA", "#E8EDE3", "#F2EEDF"],
    sun: "#F2DDA4",
    layers: ["#B3C6BA", "#8AA595", "#5F8872", "#3A6B51", "#1B4B36"],
    snow: "#FBFAF4",
    ground: "#1C4A35",
  },
  apricot: {
    sky: ["#EBD6AE", "#F3E5C8", "#F8EEDB"],
    sun: "#E7AE5E",
    layers: ["#D6C3A2", "#B79F7A", "#8C7955", "#5B5A3D", "#2E3F2D"],
    snow: "#FBF6EA",
    ground: "#3A3A26",
  },
  stone: {
    sky: ["#D6DDD8", "#E6E6DE", "#EFEBE1"],
    sun: "#EAD7A8",
    layers: ["#C0C3BA", "#9DA299", "#747D74", "#4B5A50", "#223A30"],
    snow: "#FBFAF6",
    ground: "#1F3A2F",
  },
  glacier: {
    sky: ["#C4D9D8", "#E1EAE5", "#EEF0E7"],
    sun: "#F1E2B5",
    layers: ["#B6CAC9", "#8FAEAB", "#678E88", "#3C6A5F", "#123F33"],
    snow: "#FFFFFF",
    ground: "#0F3A2F",
  },
  alpine: {
    sky: ["#6F9DC2", "#A9C9DF", "#E3EDF1"],
    sun: "#FFF1CF",
    layers: ["#C3CFD9", "#93A8B8", "#5E7E72", "#39634B", "#1B4431"],
    snow: "#FFFFFF",
    ground: "#163A29",
  },
  night: {
    sky: ["#0E3028", "#3F6155", "#C9B07C"],
    sun: "#E6C77A",
    layers: ["#6F877A", "#50695C", "#354F43", "#1D3A2E", "#0A2A20"],
    snow: "#E9E4D6",
    ground: "#082219",
  },
};

/** mulberry32 — tiny deterministic PRNG */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1200;
const H = 800;

type Pt = [number, number];

/** Ridge: a few dominant peaks refined with midpoint displacement */
function ridge(rand: () => number, base: number, amp: number, peaks: number, rough: number, depth: number): Pt[] {
  const ctrl: Pt[] = [[-20, base - amp * (0.15 + rand() * 0.3)]];
  for (let i = 0; i < peaks; i++) {
    const x0 = ((i + 0.15) / peaks) * W;
    const x1 = ((i + 0.85) / peaks) * W;
    const px = x0 + rand() * (x1 - x0);
    ctrl.push([px - (x1 - x0) * (0.25 + rand() * 0.15), base - amp * (0.2 + rand() * 0.3)]);
    ctrl.push([px, base - amp * (0.65 + rand() * 0.35)]);
  }
  ctrl.push([W + 20, base - amp * (0.15 + rand() * 0.3)]);
  ctrl.sort((a, b) => a[0] - b[0]);

  const out: Pt[] = [ctrl[0]];
  for (let i = 0; i < ctrl.length - 1; i++) {
    let seg: Pt[] = [ctrl[i], ctrl[i + 1]];
    let disp = Math.abs(ctrl[i + 1][0] - ctrl[i][0]) * rough * 0.35;
    for (let d = 0; d < depth; d++) {
      const next: Pt[] = [seg[0]];
      for (let j = 0; j < seg.length - 1; j++) {
        const [ax, ay] = seg[j];
        const [bx, by] = seg[j + 1];
        next.push([(ax + bx) / 2, (ay + by) / 2 + (rand() - 0.5) * disp], seg[j + 1]);
      }
      seg = next;
      disp *= 0.52;
    }
    out.push(...seg.slice(1));
  }
  return out;
}

const r = (n: number) => Math.round(n);
const toPath = (pts: Pt[], bottom = H + 10) =>
  `M${r(pts[0][0])} ${bottom}L${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join("L")}L${r(pts[pts.length - 1][0])} ${bottom}Z`;

/** Snow: follows the crest, ragged lower edge, only above the snowline */
function snowPath(pts: Pt[], snowline: number, rand: () => number) {
  const top = pts.filter(([, y]) => y < snowline);
  if (top.length < 3) return "";
  const groups: Pt[][] = [];
  let cur: Pt[] = [];
  for (const p of pts) {
    if (p[1] < snowline) cur.push(p);
    else if (cur.length) {
      groups.push(cur);
      cur = [];
    }
  }
  if (cur.length) groups.push(cur);
  return groups
    .filter((g) => g.length > 2)
    .map((g) => {
      const lower = g
        .map(([x, y]) => [x, Math.min(snowline, y + (snowline - y) * (0.35 + rand() * 0.4))] as Pt)
        .reverse();
      return `M${[...g, ...lower].map(([x, y]) => `${r(x)} ${r(y)}`).join("L")}Z`;
    })
    .join("");
}

/** Lombardy poplars — the tall trees lining every GB village */
function poplars(rand: () => number, y: number, count: number, spread: [number, number], scale = 1) {
  const trees: { x: number; y: number; rx: number; ry: number; o: number }[] = [];
  for (let i = 0; i < count; i++) {
    const x = spread[0] + rand() * (spread[1] - spread[0]);
    const ry = (34 + rand() * 38) * scale;
    trees.push({ x, y: y - ry * 0.85 + rand() * 10, rx: (5 + rand() * 4) * scale, ry, o: 0.85 + rand() * 0.15 });
  }
  return trees.sort((a, b) => a.y - b.y);
}

export interface LandscapeArtProps {
  art: ArtSpec;
  className?: string;
  /** "hero" adds a lake, sun glow and more depth */
  variant?: "hero" | "card";
  /** When the art stands in for a meaningful photo, pass its alt text */
  label?: string;
}

export function LandscapeArt({ art, className, variant = "card", label }: LandscapeArtProps) {
  const p = PALETTES[art.palette];
  const rand = rng(art.seed * 9973 + (variant === "hero" ? 7 : 0));
  const id = `la-${art.seed}-${art.palette}-${variant}-${art.motif ?? "x"}`;
  const hero = variant === "hero";
  const motif = hero ? "lake" : art.motif;
  const hasForeground = motif === "apricots" || motif === "terraces" || motif === "arches";

  // Ridge layers, back → front
  const layers = [
    { base: hero ? 500 : 430, amp: hero ? 330 : 330, peaks: hero ? 4 : 2, rough: 0.9, depth: 5 },
    { base: hero ? 520 : 480, amp: hero ? 250 : 230, peaks: 3, rough: 0.75, depth: 4 },
    { base: hero ? 575 : 545, amp: 170, peaks: 3, rough: 0.6, depth: 4 },
    { base: hero ? 625 : 610, amp: 110, peaks: 2, rough: 0.45, depth: 3 },
    { base: hero ? 670 : 680, amp: 70, peaks: 2, rough: 0.3, depth: 3 },
  ].map((l) => ridge(rand, l.base, l.amp, l.peaks, l.rough, l.depth));

  const snowlines = [hero ? 330 : 250, hero ? 380 : 320];
  const sunX = 250 + rand() * 700;
  const sunY = hero ? 300 : 250 + rand() * 60;
  const lakeTop = hero ? 640 : 660;
  const trees =
    motif === "lake"
      ? [...poplars(rand, lakeTop + 2, hero ? 26 : 14, [0, W * 0.42], hero ? 1.05 : 0.9), ...poplars(rand, lakeTop + 2, hero ? 10 : 6, [W * 0.78, W], 0.85)]
      : motif === "meadow" || !hasForeground
        ? poplars(rand, 700 + rand() * 20, 12, [rand() * 300, 500 + rand() * 600], 0.9)
        : [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx={sunX / W} cy={sunY / H} r="0.45">
          <stop offset="0" stopColor={p.sun} stopOpacity={hero ? 0.75 : 0.55} />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        {p.layers.map((c, i) => (
          <linearGradient key={i} id={`${id}-l${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} />
            <stop offset="1" stopColor={p.layers[Math.min(4, i + 1)]} />
          </linearGradient>
        ))}
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[2]} stopOpacity="0" />
          <stop offset="1" stopColor={p.sky[2]} stopOpacity="0.45" />
        </linearGradient>
        {motif === "lake" && (
          <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={hero ? (art.palette === "alpine" ? "#3A9A99" : "#2F6B63") : p.layers[2]} />
            <stop offset="1" stopColor={hero ? (art.palette === "alpine" ? "#14605A" : "#0B3A31") : p.layers[4]} />
          </linearGradient>
        )}
      </defs>

      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <rect width={W} height={H} fill={`url(#${id}-sun)`} />

      {layers.map((pts, i) => (
        <g key={i}>
          <path d={toPath(pts)} fill={`url(#${id}-l${i})`} />
          {i < 2 && <path d={snowPath(pts, snowlines[i], rand)} fill={p.snow} opacity={i === 0 ? 0.92 : 0.7} />}
          {i === 1 && <rect y={380} width={W} height={H - 380} fill={`url(#${id}-haze)`} opacity="0.5" />}
        </g>
      ))}

      {motif === "lake" && (
        <g>
          <rect y={lakeTop} width={W} height={H - lakeTop} fill={`url(#${id}-water)`} />
          {/* mirrored crest, very faint */}
          <path
            d={toPath(layers[2].map(([x, y]) => [x, lakeTop + (lakeTop - y) * 0.35] as Pt), lakeTop)}
            fill={p.layers[3]}
            opacity="0.35"
          />
          {Array.from({ length: hero ? 9 : 5 }, (_, i) => {
            const y = lakeTop + 18 + i * (hero ? 16 : 22);
            const x = 120 + rand() * 800;
            return <rect key={i} x={x} y={y} width={80 + rand() * 220} height="1.5" fill={p.sun} opacity={0.18 + rand() * 0.2} />;
          })}
        </g>
      )}

      {motif === "terraces" &&
        Array.from({ length: 6 }, (_, i) => {
          const y = 600 + i * 38;
          const c = i % 2 ? p.layers[3] : p.layers[4];
          return (
            <path
              key={i}
              d={`M-10 ${y + 12}C300 ${y - 14} 700 ${y + 22} 1210 ${y - 6}L1210 ${H + 10}L-10 ${H + 10}Z`}
              fill={c}
              opacity={0.92}
            />
          );
        })}

      {motif === "apricots" && (
        <g>
          <path d={`M-10 610C400 590 800 600 1210 585L1210 ${H + 10}L-10 ${H + 10}Z`} fill="#5C4A2E" />
          <path d={`M-10 630C400 612 800 622 1210 606L1210 ${H + 10}L-10 ${H + 10}Z`} fill="#8A6A3C" />
          {Array.from({ length: 7 }, (_, row) => {
            const y = 650 + row * row * 3.2 + row * 14;
            const s = 3.2 + row * 1.35;
            const n = Math.round(W / (s * 3.4));
            return Array.from({ length: n }, (_, k) => {
              const x = k * (W / n) + ((row % 2) * W) / n / 2 + (rand() - 0.5) * s;
              const tone = ["#E8A64B", "#DB9038", "#F0B962", "#C97E2E"][Math.floor(rand() * 4)];
              return <ellipse key={`${row}-${k}`} cx={r(x)} cy={r(y + (rand() - 0.5) * 2)} rx={s} ry={s * 0.72} fill={tone} />;
            });
          })}
        </g>
      )}

      {motif === "arches" && (
        <g>
          <rect y={640} width={W} height={H - 640} fill={p.ground} />
          <rect y={632} width={W} height={10} fill={p.layers[3]} />
          {Array.from({ length: 9 }, (_, i) => {
            const x = 30 + i * 132;
            return (
              <path
                key={i}
                d={`M${x} ${H}V716a50 50 0 0 1 100 0V${H}Z`}
                fill={p.sky[2]}
                opacity={0.16 + (i % 3) * 0.05}
              />
            );
          })}
          <rect y={H - 22} width={W} height={22} fill={p.layers[4]} />
        </g>
      )}

      {trees.map((t, i) => (
        <ellipse key={i} cx={r(t.x)} cy={r(t.y)} rx={r(t.rx)} ry={r(t.ry)} fill={p.ground} opacity={t.o} />
      ))}
    </svg>
  );
}
