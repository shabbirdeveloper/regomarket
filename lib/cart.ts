import { useSyncExternalStore } from "react";

/**
 * Shopping cart, kept on this device. Prices here are only for showing the
 * cart: checkout always re-reads the real price from the database
 * (place_order), so a changed price can never be sneaked in.
 */
export interface CartItem {
  listingId: string;
  slug: string;
  title: string;
  image: string | null;
  price: number;
  /** "KG", "piece" … */
  unit?: string;
  sellerId: string;
  shopName: string;
  shopSlug?: string;
  shopDistrict: string;
  qty: number;
  addedAt: number;
}

const KEY = "rego:cart:v1";
const MAX_QTY = 999;
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;
const EMPTY: CartItem[] = [];

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: CartItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n) || 1));

export const cart = {
  all: read,
  add(item: Omit<CartItem, "qty" | "addedAt">, qty = 1) {
    const cur = read();
    const found = cur.find((x) => x.listingId === item.listingId);
    write(
      found
        ? cur.map((x) => (x.listingId === item.listingId ? { ...x, ...item, qty: clamp(x.qty + qty) } : x))
        : [...cur, { ...item, qty: clamp(qty), addedAt: Date.now() }],
    );
  },
  /** Put exactly `qty` of this item in the cart (Buy now) */
  set(item: Omit<CartItem, "qty" | "addedAt">, qty: number) {
    const cur = read().filter((x) => x.listingId !== item.listingId);
    write([...cur, { ...item, qty: clamp(qty), addedAt: Date.now() }]);
  },
  setQty(listingId: string, qty: number) {
    write(read().map((x) => (x.listingId === listingId ? { ...x, qty: clamp(qty) } : x)));
  },
  update(listingId: string, patch: Partial<CartItem>) {
    write(read().map((x) => (x.listingId === listingId ? { ...x, ...patch } : x)));
  },
  remove(listingId: string) {
    write(read().filter((x) => x.listingId !== listingId));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = items.reduce((n, x) => n + x.qty, 0);
  const lines = items.length;
  const subtotal = items.reduce((n, x) => n + x.price * x.qty, 0);
  return { items, count, lines, subtotal, ...cart };
}

/** Group lines by shop (one order per shop at checkout) */
export function byShop(items: CartItem[]) {
  const map = new Map<string, { sellerId: string; shopName: string; shopSlug?: string; shopDistrict: string; items: CartItem[]; subtotal: number }>();
  for (const it of [...items].sort((a, b) => a.addedAt - b.addedAt)) {
    const g = map.get(it.sellerId) ?? { sellerId: it.sellerId, shopName: it.shopName, shopSlug: it.shopSlug, shopDistrict: it.shopDistrict, items: [], subtotal: 0 };
    g.items.push(it);
    g.subtotal += it.price * it.qty;
    map.set(it.sellerId, g);
  }
  return [...map.values()];
}

/** Same rule as the database (delivery_fee): same district 150, otherwise 250. */
export const deliveryFee = (shopDistrict: string, shipDistrict: string): number => (shopDistrict === shipDistrict ? 150 : 250);
