"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Inbox, Mail, Phone, Reply, Search, Send } from "lucide-react";
import type { AdminInboxMessage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { Drawer } from "../ui/overlay";
import { Avatar, Btn, EmptyState } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const TEMPLATES = [
  { label: "Ad review", text: "Salam! New ads are checked within a few hours (9 AM – 9 PM). Yours will go live once approved — you'll get an SMS." },
  { label: "OTP warning", text: "Salam! REGOMARKET never calls or messages for your OTP code. Please don't share it with anyone, and report that number from the Help page." },
  { label: "Change number", text: "Salam! Please send your old and new phone numbers here. We'll move your account after a short check." },
  { label: "Thanks", text: "Shukriya for the suggestion! We've shared it with the team." },
];

const TABS = [
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "closed", label: "Closed" },
  { key: "all", label: "All" },
] as const;

export function InboxModule({ initial, query }: { initial: AdminInboxMessage[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("inbox", initial);
  const [tab, setTab] = useState<string>(query.tab ?? "new");
  const [q, setQ] = useState(query.q ?? "");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows
      .filter((m) => tab === "all" || m.status === tab)
      .filter((m) => !n || `${m.name} ${m.topic} ${m.message}`.toLowerCase().includes(n))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [rows, tab, q]);

  // Desktop: keep something selected
  useEffect(() => {
    if (narrow) return;
    if (!openId || !list.some((m) => m.id === openId)) setOpenId(list[0]?.id ?? null);
  }, [list, openId, narrow]);

  useEffect(() => setDraft(""), [openId]);

  const open = rows.find((m) => m.id === openId) ?? null;
  const count = (k: string) => (k === "all" ? rows.length : rows.filter((m) => m.status === k).length);

  const send = (m: AdminInboxMessage) => {
    patch("inbox", m.id, { status: "replied", reply: draft.trim() }, { action: "Replied to message", target: m.name, toast: `Reply sent to ${m.name}`, undoable: false });
    setDraft("");
  };

  const detail = open && (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3">
        <Avatar name={open.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-semibold text-ink">{open.name}</p>
          <p className="flex items-center gap-1.5 text-[13px] text-muted">
            {open.reach.includes("@") ? <Mail className="size-3.5" aria-hidden /> : <Phone className="size-3.5" aria-hidden />} {open.reach}
          </p>
        </div>
        <StatusPill status={open.status} />
      </div>
      <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-gold-ink">{open.topic}</p>
      <div className="mt-2 rounded-2xl rounded-tl-md bg-stone px-4 py-3 text-[14.5px] leading-relaxed text-ink">{open.message}</div>
      <p className="mt-1 text-[12px] text-muted">
        <When iso={open.createdAt} />
      </p>

      {open.reply && (
        <div className="ml-auto mt-4 max-w-[85%]">
          <div className="rounded-2xl rounded-tr-md bg-mountain px-4 py-3 text-[14px] leading-relaxed text-white">{open.reply}</div>
          <p className="mt-1 text-right text-[12px] text-muted">Your reply</p>
        </div>
      )}

      {open.status !== "closed" && (
        <div className="mt-auto pt-6">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => setDraft(t.text)} className="rounded-full border border-line-strong bg-white px-3 py-1 text-[12px] font-medium text-ink/80 hover:border-mountain hover:text-mountain">
                {t.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line-strong bg-white focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]">
            <textarea
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Reply to ${open.name}…`}
              aria-label="Reply"
              className="w-full resize-none rounded-xl bg-transparent px-4 py-3 text-[14px] outline-none"
            />
            <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
              <Btn size="sm" tone="ghost" onClick={() => patch("inbox", open.id, { status: "closed" }, { action: "Closed message", target: open.name, toast: "Closed" })}>
                <Archive /> Close
              </Btn>
              <Btn size="sm" tone="primary" disabled={!draft.trim()} onClick={() => send(open)}>
                <Send /> Send by {open.reach.includes("@") ? "email" : "SMS"}
              </Btn>
            </div>
          </div>
        </div>
      )}
      {open.status === "closed" && (
        <Btn className="mt-6 self-start" onClick={() => patch("inbox", open.id, { status: "new" }, { action: "Reopened message", target: open.name, toast: "Moved back to New" })}>
          <Reply /> Reopen
        </Btn>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white lg:grid lg:h-[calc(100dvh-220px)] lg:min-h-[520px] lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* List */}
      <div className="flex min-h-0 flex-col border-line lg:border-r">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 pt-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn("relative flex h-11 shrink-0 items-center gap-1.5 px-3 text-[13.5px] font-semibold", tab === t.key ? "text-mountain" : "text-muted hover:text-ink")}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-[11.5px]", tab === t.key ? "bg-mint text-mountain" : "bg-stone text-muted")}>{count(t.key)}</span>
              {tab === t.key && <span aria-hidden className="absolute inset-x-2 -bottom-px h-[2.5px] rounded-full bg-mountain" />}
            </button>
          ))}
        </div>
        <div className="border-b border-line p-3">
          <label className="relative block">
            <span className="sr-only">Search messages</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search messages"
              className="h-10 w-full rounded-lg border border-line-strong pl-9 pr-3 text-[14px] outline-none focus:border-mountain"
            />
          </label>
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<Inbox />} title="Inbox zero" body="No messages in this tab." />
        ) : (
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
            {list.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(m.id)}
                  className={cn("flex w-full gap-3 px-4 py-3.5 text-left transition-colors", openId === m.id && !narrow ? "bg-mint/60" : "hover:bg-[#fbfaf6]")}
                >
                  <Avatar name={m.name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={cn("truncate text-[14px] text-ink", m.status === "new" ? "font-bold" : "font-medium")}>{m.name}</span>
                      <When iso={m.createdAt} className="shrink-0 text-[11.5px] text-muted" />
                    </span>
                    <span className="block truncate text-[12.5px] font-semibold text-gold-ink">{m.topic}</span>
                    <span className="block truncate text-[13px] text-muted">{m.message}</span>
                  </span>
                  {m.status === "new" && <span aria-label="New" className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reading pane (desktop) */}
      <div className="hidden min-h-0 overflow-y-auto p-6 lg:block">{detail ?? <EmptyState icon={<Mail />} title="Pick a message" />}</div>

      {/* Phones */}
      <Drawer open={narrow && Boolean(open)} onClose={() => setOpenId(null)} title={open?.topic ?? ""}>
        {detail}
      </Drawer>
    </div>
  );
}
