"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuditEntry } from "@/lib/admin/types";
import type { ModuleKey } from "@/lib/admin/modules";
import type { Queues } from "@/lib/admin/data";

/**
 * Admin preview store.
 *
 * Until Supabase Auth is live, admin actions (approve, reject, ban…) are kept
 * on this device (localStorage) so the whole panel behaves for real: badges
 * update, the activity log fills, undo works. Each action already has the
 * shape of the Supabase RPC it will call (`admin_moderate(entity, id, status, reason)`).
 */

type Row = Record<string, unknown>;
type Patches = Partial<Record<ModuleKey, Record<string, Row>>>;
type Added = Partial<Record<ModuleKey, Row[]>>;

interface Persisted {
  patches: Patches;
  added: Added;
  log: AuditEntry[];
}

export interface AdminSessionView {
  name: string;
  role: "owner" | "admin" | "moderator" | "support";
  initials: string;
}

interface Toast {
  id: number;
  text: string;
  tone: "success" | "info" | "danger";
  undo?: () => void;
}

interface ActOpts {
  /** Activity-log line, e.g. "Approved ad" */
  action?: string;
  /** What it was done to (title / name) */
  target?: string;
  detail?: string;
  toast?: string;
  tone?: Toast["tone"];
  /** Set false to hide the Undo button */
  undoable?: boolean;
}

interface Ctx {
  admin: AdminSessionView;
  ready: boolean;
  patchesFor: (m: ModuleKey) => Record<string, Row>;
  addedFor: (m: ModuleKey) => Row[];
  patch: (m: ModuleKey, ids: string | string[], changes: Row, opts?: ActOpts) => void;
  add: (m: ModuleKey, row: Row, opts?: ActOpts) => void;
  notify: (text: string, tone?: Toast["tone"]) => void;
  log: AuditEntry[];
  queueCount: (m: ModuleKey) => number | undefined;
  reset: () => void;
}

const AdminCtx = createContext<Ctx | null>(null);
const KEY = "rego:admin:v1";
const EMPTY: Persisted = { patches: {}, added: {}, log: [] };

/** Which rows count as "waiting" for the sidebar badges */
const WAITING: Partial<Record<ModuleKey, (status: unknown) => boolean>> = {
  listings: (s) => s === "pending",
  shops: (s) => s === "pending",
  verifications: (s) => s === "pending",
  reports: (s) => s === "open" || s === "reviewing",
  reviews: (s) => s === "flagged",
  orders: (s) => s === "placed",
  inbox: (s) => s === "new",
};

export function AdminStoreProvider({ admin, queues, children }: { admin: AdminSessionView; queues: Queues; children: ReactNode }) {
  const [state, setState] = useState<Persisted>(EMPTY);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  // Load after mount so server and client render the same first frame
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* private mode / blocked storage: keep in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const pushToast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++seq.current;
      setToasts((list) => [...list.slice(-2), { ...t, id }]);
      setTimeout(() => dismiss(id), t.undo ? 6000 : 3500);
    },
    [dismiss],
  );

  const entry = useCallback(
    (m: ModuleKey, opts?: ActOpts): AuditEntry | null =>
      opts?.action
        ? {
            id: `au-l-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            at: new Date().toISOString(),
            by: admin.name,
            action: opts.action,
            module: m,
            target: opts.target ?? "",
            detail: opts.detail,
          }
        : null,
    [admin.name],
  );

  const patch = useCallback<Ctx["patch"]>(
    (m, idOrIds, changes, opts) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      let before: Record<string, Row | undefined> = {};
      const log = entry(m, opts);
      setState((s) => {
        const cur = s.patches[m] ?? {};
        before = Object.fromEntries(ids.map((id) => [id, cur[id]]));
        const next = { ...cur };
        for (const id of ids) next[id] = { ...cur[id], ...changes };
        return { ...s, patches: { ...s.patches, [m]: next }, log: log ? [log, ...s.log].slice(0, 300) : s.log };
      });
      if (opts?.toast) {
        pushToast({
          text: opts.toast,
          tone: opts.tone ?? "success",
          undo:
            opts.undoable === false
              ? undefined
              : () =>
                  setState((s) => {
                    const cur = { ...(s.patches[m] ?? {}) };
                    for (const id of ids) {
                      if (before[id]) cur[id] = before[id]!;
                      else delete cur[id];
                    }
                    return { ...s, patches: { ...s.patches, [m]: cur }, log: log ? s.log.filter((x) => x.id !== log.id) : s.log };
                  }),
        });
      }
    },
    [entry, pushToast],
  );

  const add = useCallback<Ctx["add"]>(
    (m, row, opts) => {
      const log = entry(m, opts);
      setState((s) => ({
        ...s,
        added: { ...s.added, [m]: [row, ...(s.added[m] ?? [])] },
        log: log ? [log, ...s.log].slice(0, 300) : s.log,
      }));
      if (opts?.toast) pushToast({ text: opts.toast, tone: opts.tone ?? "success" });
    },
    [entry, pushToast],
  );

  const notify = useCallback<Ctx["notify"]>((text, tone = "info") => pushToast({ text, tone }), [pushToast]);

  const queueCount = useCallback<Ctx["queueCount"]>(
    (m) => {
      const ids = queues[m as keyof Queues];
      const waiting = WAITING[m];
      if (!ids || !waiting) return undefined;
      const p = state.patches[m] ?? {};
      const fromBase = ids.filter((id) => !p[id] || !("status" in p[id]) || waiting(p[id].status)).length;
      const fromAdded = (state.added[m] ?? []).filter((r) => waiting(r.status)).length;
      return fromBase + fromAdded;
    },
    [queues, state],
  );

  const reset = useCallback(() => {
    setState(EMPTY);
    pushToast({ text: "Preview data reset", tone: "info" });
  }, [pushToast]);

  const value = useMemo<Ctx>(
    () => ({
      admin,
      ready,
      patchesFor: (m) => state.patches[m] ?? {},
      addedFor: (m) => state.added[m] ?? [],
      patch,
      add,
      notify,
      log: state.log,
      queueCount,
      reset,
    }),
    [admin, ready, state, patch, add, notify, queueCount, reset],
  );

  return (
    <AdminCtx.Provider value={value}>
      {children}
      <Toaster toasts={toasts} dismiss={dismiss} />
    </AdminCtx.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminCtx);
  if (!ctx) throw new Error("useAdmin must be used inside <AdminStoreProvider>");
  return ctx;
}

/** Server rows + this device's changes + rows created here. */
export function useRows<T extends object>(m: ModuleKey, initial: T[], idKey: keyof T = "id" as keyof T): T[] {
  const { patchesFor, addedFor } = useAdmin();
  const p = patchesFor(m);
  const added = addedFor(m) as unknown as T[];
  return useMemo(() => {
    const base = initial.map((r) => {
      const c = p[String(r[idKey])];
      return c ? ({ ...r, ...c } as unknown as T) : r;
    });
    const extra = added.map((r) => {
      const c = p[String(r[idKey])];
      return c ? ({ ...r, ...c } as unknown as T) : r;
    });
    return [...extra, ...base].filter((r) => !(r as unknown as { _deleted?: boolean })._deleted);
  }, [initial, p, added, idKey]);
}

/* ---------- Toasts ---------- */

function Toaster({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-6 md:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-center gap-3 rounded-xl bg-[#0f1a15] px-4 py-3 text-[13.5px] text-white shadow-[0_18px_40px_-16px_rgb(0_0_0/0.55)] ring-1 ring-white/10"
        >
          <span
            aria-hidden
            className={
              "size-2 shrink-0 rounded-full " +
              (t.tone === "success" ? "bg-[#4ade80]" : t.tone === "danger" ? "bg-[#f87171]" : "bg-gold-soft")
            }
          />
          <span className="min-w-0 flex-1">{t.text}</span>
          {t.undo && (
            <button
              type="button"
              onClick={() => {
                t.undo?.();
                dismiss(t.id);
              }}
              className="shrink-0 rounded-md px-2 py-1 text-[13px] font-semibold text-gold-soft hover:bg-white/10"
            >
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
