"use client";

import { useMemo, useState } from "react";
import { Activity, Clock, Download, Search } from "lucide-react";
import type { AuditEntry } from "@/lib/admin/types";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { useAdmin } from "../store";
import { Avatar, Btn, EmptyState } from "../ui/primitives";

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date(Date.now() - 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, y)) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function ActivityModule({ initial }: { initial: AuditEntry[] }) {
  const { log } = useAdmin();
  const [q, setQ] = useState("");
  const [mod, setMod] = useState("");
  const [who, setWho] = useState("");

  const all = useMemo(() => [...log, ...initial].sort((a, b) => +new Date(b.at) - +new Date(a.at)), [log, initial]);
  const people = useMemo(() => [...new Set(all.map((e) => e.by))], [all]);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return all.filter((e) => (!mod || e.module === mod) && (!who || e.by === who) && (!n || `${e.action} ${e.target} ${e.detail ?? ""} ${e.by}`.toLowerCase().includes(n)));
  }, [all, q, mod, who]);

  const groups = useMemo(() => {
    const g: { day: string; items: AuditEntry[] }[] = [];
    for (const e of list) {
      const day = dayLabel(e.at);
      const last = g[g.length - 1];
      if (last?.day === day) last.items.push(e);
      else g.push({ day, items: [e] });
    }
    return g;
  }, [list]);

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [["When", "Admin", "Action", "Module", "Target", "Detail"].join(",")].concat(
      list.map((e) => [new Date(e.at).toISOString(), e.by, e.action, e.module, e.target, e.detail ?? ""].map((v) => esc(String(v))).join(",")),
    );
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `regomarket-activity-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-line bg-white">
      <div className="flex flex-col gap-2 border-b border-line p-3 md:flex-row md:items-center">
        <label className="relative block md:w-72">
          <span className="sr-only">Search activity</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search activity" className="h-10 w-full rounded-lg border border-line-strong pl-9 pr-3 text-[14px] outline-none focus:border-mountain" />
        </label>
        <select value={mod} onChange={(e) => setMod(e.target.value)} aria-label="Module" className="h-10 rounded-lg border border-line-strong bg-white px-3 text-[13.5px]">
          <option value="">Module: All</option>
          {ADMIN_MODULES.filter((m) => m.key !== "overview" && m.key !== "activity").map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Admin" className="h-10 rounded-lg border border-line-strong bg-white px-3 text-[13.5px]">
          <option value="">Admin: All</option>
          {people.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <Btn className="md:ml-auto" onClick={exportCsv} disabled={!list.length}>
          <Download /> Export CSV
        </Btn>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon={<Activity />} title="No activity" body="Actions taken in the admin show up here." />
      ) : (
        <div className="divide-y divide-line">
          {groups.map((g) => (
            <section key={g.day} className="px-4 py-4 md:px-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted" suppressHydrationWarning>
                {g.day}
              </h2>
              <ul className="mt-3 space-y-3">
                {g.items.map((e) => {
                  const m = ADMIN_MODULES.find((x) => x.key === e.module);
                  const Icon = m?.icon ?? Clock;
                  return (
                    <li key={e.id} className="flex items-start gap-3">
                      <Avatar name={e.by} size={32} />
                      <div className="min-w-0 flex-1 text-[13.5px]">
                        <p className="text-ink">
                          <span className="font-semibold">{e.by}</span> {e.action.toLowerCase()} <span className="font-medium">{e.target}</span>
                        </p>
                        {e.detail && <p className="text-[12.5px] text-muted">“{e.detail}”</p>}
                      </div>
                      <span className="hidden items-center gap-1 rounded-md bg-stone px-2 py-1 text-[11.5px] font-medium text-ink/70 sm:inline-flex">
                        <Icon className="size-3.5" aria-hidden /> {m?.label ?? e.module}
                      </span>
                      <time dateTime={e.at} className="w-14 shrink-0 text-right text-[12px] tabular-nums text-muted" suppressHydrationWarning>
                        {new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
