"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tiny device-local store for saved listings / followed shops until the user
 * signs in (then synced to Supabase `saved_listings` / `shop_follows`).
 * Shared across components on the page without a context provider.
 */
function createStore(key: string) {
  const listeners = new Set<() => void>();
  let cache: string[] | null = null;
  const EMPTY: string[] = [];

  const read = (): string[] => {
    if (cache) return cache;
    try {
      cache = JSON.parse(localStorage.getItem(key) ?? "[]");
    } catch {
      cache = [];
    }
    return cache!;
  };

  const write = (next: string[]) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep in memory */
    }
    listeners.forEach((l) => l());
  };

  return {
    subscribe(l: () => void) {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cache = null;
          l();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener("storage", onStorage);
      };
    },
    getSnapshot: read,
    getServerSnapshot: () => EMPTY,
    toggle(id: string) {
      const cur = read();
      write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    },
  };
}

const stores = {
  saved: createStore("rego:saved"),
  following: createStore("rego:following"),
};

export function usePersistentSet(name: keyof typeof stores) {
  const store = stores[name];
  const ids = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const toggle = useCallback((id: string) => store.toggle(id), [store]);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, has, toggle, count: ids.length };
}
