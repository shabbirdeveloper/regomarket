import type { Place, Price, PriceUnit, WantedRequest } from "@/types";
import { districtBySlug } from "@/data/locations";

const nf = new Intl.NumberFormat("en-US");

export const formatNumber = (n: number) => nf.format(n);

const UNIT_LABEL: Record<PriceUnit, string> = {
  kg: "KG",
  maund: "Maund",
  piece: "piece",
  month: "month",
  day: "day",
  litre: "litre",
  dozen: "dozen",
  kanal: "Kanal",
  bottle: "bottle",
};

export const unitLabel = (unit?: PriceUnit) => (unit ? UNIT_LABEL[unit] : "");

/** "Rs 1,200" */
export function formatRs(amount: number) {
  return `Rs ${nf.format(amount)}`;
}

/** { amount, unit } → { main: "Rs 1,200", unit: "/ KG" } */
export function formatPrice(price: Price) {
  return {
    main: formatRs(price.amount),
    unit: price.unit ? `/ ${unitLabel(price.unit)}` : "",
  };
}

/** Local-language helper: 18,000,000 → "1.8 Crore", 260,000 → "2.6 Lakh" */
export function toLakhCrore(amount: number): string | null {
  if (amount >= 10_000_000) return `${trim(amount / 10_000_000)} Crore`;
  if (amount >= 100_000) return `${trim(amount / 100_000)} Lakh`;
  return null;
}
const trim = (n: number) => (Math.round(n * 100) / 100).toString();

export function formatBudget(b: WantedRequest["budget"]) {
  if (b.negotiable && !b.min && !b.max) return "Negotiable";
  const unit = b.unit ? ` / ${unitLabel(b.unit)}` : "";
  const compact = (n: number) => (n >= 100_000 ? toLakhCrore(n)! : nf.format(n));
  if (b.min && b.max) return `Rs ${compact(b.min)}–${compact(b.max)}${unit}`;
  if (b.max) return `Up to Rs ${compact(b.max)}${unit}`;
  if (b.min) return `From Rs ${compact(b.min)}${unit}`;
  return "Negotiable";
}

/** "Shigar, GB" style location for cards */
export function placeLabel(place: Place, opts: { withTown?: boolean } = {}) {
  const district = districtBySlug[place.district]?.name ?? place.district;
  if (opts.withTown && place.town && place.town !== district) return `${place.town}, ${district}`;
  return `${district}, GB`;
}

/** "2h ago" — computed on the server so client hydration never mismatches */
export function timeAgo(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
