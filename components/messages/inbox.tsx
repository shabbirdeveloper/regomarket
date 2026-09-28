"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, BadgeCheck, Check, CheckCheck, HandCoins, MessageSquareText, Search, SendHorizontal, ShieldCheck, X } from "lucide-react";
import type { ListingCardData } from "@/types";
import { formatNumber, unitLabel } from "@/lib/format";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export interface InboxMessage {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  offer?: number;
  /** Live mode: has the other person seen it (my messages only) */
  read?: boolean;
}

export interface InboxConversation {
  id: string;
  with: { name: string; shopSlug?: string; verified: boolean; online?: boolean };
  role: "buying" | "selling";
  unread: number;
  listing: ListingCardData;
  messages: InboxMessage[];
  /** Shown instead of the message box (e.g. seller not on chat yet) */
  notice?: string;
}

/** Live mode (Supabase): how the inbox sends, marks read and hears new messages. */
export interface InboxLive {
  /** Returns the real conversation id (new chats get one on the first message) and message id */
  send: (c: InboxConversation, text: string, offer?: number) => Promise<{ conversationId: string; id: string; at: string }>;
  markRead: (conversationId: string) => void;
  /** Calls back for every new message in any of my chats; returns unsubscribe */
  subscribe: (on: (conversationId: string, m: InboxMessage) => void) => () => void;
  /** Loads a chat that isn't in the list yet (someone just messaged me) */
  load: (conversationId: string) => Promise<InboxConversation | null>;
}

type Filter = "all" | "buying" | "selling" | "unread";

const TZ = "Asia/Karachi";
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: TZ });
const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", day: "numeric", month: "short", timeZone: TZ });
const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));

const QUICK = {
  buying: ["Is it still available?", "What's your final price?", "Can you deliver to my area?", "Where can I see it?"],
  selling: ["Yes, it's available.", "The price is a little negotiable.", "You can see it in Jutial.", "I can share more photos."],
};

const TONES = ["bg-[#2f6f57]", "bg-[#a0773a]", "bg-[#3e7391]", "bg-[#a86448]", "bg-[#5d7566]"];
const toneFor = (seed: string) => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
};
const initials = (n: string) =>
  n
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Avatar({ name, online, size = 44 }: { name: string; online?: boolean; size?: number }) {
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        className={cn("grid size-full place-items-center rounded-full text-[13px] font-semibold text-white", toneFor(name))}
        aria-hidden
      >
        {initials(name)}
      </span>
      {online && <span className="absolute bottom-0 right-0 size-3 rounded-full bg-[#22c55e] ring-2 ring-white" aria-label="Online" />}
    </span>
  );
}

/**
 * Buyer–seller chat. Messages you send stay on this page for now; they go to
 * Supabase Realtime once accounts are live.
 */
export function Inbox({ initial, initialId, live }: { initial: InboxConversation[]; initialId: string | null; live?: InboxLive }) {
  const [convos, setConvos] = useState(initial);
  const [sendError, setSendError] = useState("");
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [offer, setOffer] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const active = convos.find((c) => c.id === activeId) ?? null;

  // Opening a chat marks it read and keeps the URL shareable
  useEffect(() => {
    if (!activeId) return;
    setConvos((cs) => cs.map((c) => (c.id === activeId && c.unread ? { ...c, unread: 0 } : c)));
    setSendError("");
    if (activeId.startsWith("new-")) return; // a chat that doesn't exist yet keeps its ?listing= link
    live?.markRead(activeId);
    const url = new URL(window.location.href);
    url.search = `?c=${activeId}`;
    history.replaceState(null, "", url);
  }, [activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, active?.messages.length]);

  // Live: new messages from the other side (and from my other devices), plus read ticks
  const activeRef = useRef(activeId);
  const idsRef = useRef<Set<string>>(new Set());
  activeRef.current = activeId;
  idsRef.current = new Set(convos.map((c) => c.id));
  useEffect(() => {
    if (!live) return;
    return live.subscribe((convId, m) => {
      if (!idsRef.current.has(convId)) {
        if (m.from === "me") return; // my own first message in a new chat: send() adds the chat
        live.load(convId).then((c) => c && setConvos((cs) => (cs.some((x) => x.id === c.id) ? cs : [c, ...cs])));
        return;
      }
      setConvos((cs) =>
        cs.map((c) => {
          if (c.id !== convId) return c;
          if (c.messages.some((x) => x.id === m.id)) return { ...c, messages: c.messages.map((x) => (x.id === m.id ? { ...x, read: m.read } : x)) };
          const open = activeRef.current === convId;
          return { ...c, messages: [...c.messages, m], unread: m.from === "them" && !open ? c.unread + 1 : c.unread };
        }),
      );
      if (activeRef.current === convId && m.from === "them" && !m.read) live.markRead(convId);
    });
  }, [live]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return convos
      .filter((c) => (filter === "all" ? true : filter === "unread" ? c.unread > 0 : c.role === filter))
      .filter((c) => !needle || `${c.with.name} ${c.listing.title}`.toLowerCase().includes(needle))
      .sort((a, b) => +new Date(b.messages.at(-1)?.at ?? 0) - +new Date(a.messages.at(-1)?.at ?? 0));
  }, [convos, filter, q]);

  const send = async (text: string, amount?: number) => {
    if (!active || active.notice || (!text.trim() && !amount)) return;
    const msg: InboxMessage = { id: `local-${Date.now()}`, from: "me", text: text.trim(), at: new Date().toISOString(), offer: amount };
    const convId = active.id;
    setConvos((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: [...c.messages, msg] } : c)));
    setDraft("");
    setSendError("");
    inputRef.current?.focus();
    if (!live) return;
    try {
      const r = await live.send(active, msg.text, amount);
      setConvos((cs) =>
        cs.map((c) =>
          c.id === convId
            ? {
                ...c,
                id: r.conversationId,
                // the realtime copy may have arrived first
                messages: c.messages.some((x) => x.id === r.id) ? c.messages.filter((x) => x.id !== msg.id) : c.messages.map((x) => (x.id === msg.id ? { ...x, id: r.id, at: r.at } : x)),
              }
            : c,
        ),
      );
      if (convId !== r.conversationId) {
        setActiveId(r.conversationId);
      }
    } catch (e) {
      setConvos((cs) => cs.map((c) => (c.id === convId ? { ...c, messages: c.messages.filter((x) => x.id !== msg.id) } : c)));
      setDraft(text);
      setSendError((e as Error).message || "Message not sent. Try again.");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };
  const sendOffer = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(offer.replace(/[^\d]/g, ""));
    if (!n) return;
    send("My offer", n);
    setOffer("");
    setOfferOpen(false);
  };

  const totalUnread = convos.reduce((n, c) => n + c.unread, 0);
  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "buying", label: "Buying" },
    { id: "selling", label: "Selling" },
    { id: "unread", label: totalUnread ? `Unread (${totalUnread})` : "Unread" },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] overflow-hidden rounded-2xl border border-line bg-white lg:h-[calc(100dvh-190px)] lg:min-h-[560px] lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* ---------- List ---------- */}
      <aside className={cn("flex min-h-0 flex-col border-line lg:border-r", active && "hidden lg:flex")} aria-label="Conversations">
        <div className="border-b border-line p-4">
          <label className="relative block">
            <span className="sr-only">Search chats</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search chats"
              className="h-10 w-full rounded-full border border-line-strong bg-cream pl-10 pr-4 text-[14px] outline-none placeholder:text-muted focus:border-mountain focus:bg-white"
            />
          </label>
          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 text-[12.5px] font-medium transition-colors",
                  filter === f.id ? "bg-ink text-white" : "bg-stone text-ink/80 hover:bg-line",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="min-h-0 flex-1 overflow-y-auto">
          {list.map((c) => {
            const last = c.messages.at(-1);
            const on = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(c.id)}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-line px-4 py-3.5 text-left transition-colors",
                    on ? "bg-mint" : "hover:bg-cream",
                  )}
                >
                  <Avatar name={c.with.name} online={c.with.online} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn("truncate text-[14.5px] text-ink", c.unread ? "font-semibold" : "font-medium")}>{c.with.name}</span>
                      <span className="shrink-0 text-[11.5px] text-muted">{last ? timeFmt.format(new Date(last.at)) : ""}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[12px] text-muted">
                      {c.role === "buying" ? "Buying" : "Selling"} · {c.listing.title}
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-2">
                      <span className={cn("truncate text-[13px]", c.unread ? "font-medium text-ink" : "text-ink/65")}>
                        {last?.from === "me" && "You: "}
                        {last?.offer ? `Offer Rs ${formatNumber(last.offer)}` : last?.text}
                      </span>
                      {c.unread > 0 && (
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-mountain text-[11px] font-semibold text-white">{c.unread}</span>
                      )}
                    </span>
                  </span>
                  <span className="relative hidden size-11 shrink-0 overflow-hidden rounded-lg bg-stone sm:block">
                    {c.listing.images[0]?.src && <Image src={c.listing.images[0].src} alt="" fill sizes="44px" className="object-cover" />}
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="px-6 py-12 text-center text-[13.5px] text-muted">No chats here.</li>}
        </ul>
      </aside>

      {/* ---------- Chat ---------- */}
      {active ? (
        <section className="flex min-w-0 flex-col bg-white max-md:fixed max-md:inset-0 max-md:z-[60] md:h-[calc(100dvh-200px)] md:min-h-[480px] lg:h-auto" aria-label={`Chat with ${active.with.name}`}>
          {/* Who */}
          <header className="flex items-center gap-3 border-b border-line px-3 py-3 md:px-5">
            <button
              type="button"
              onClick={() => setActiveId(null)}
              aria-label="Back to chats"
              className="grid size-9 place-items-center rounded-full hover:bg-stone lg:hidden"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
            <Avatar name={active.with.name} online={active.with.online} size={40} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-ink">
                {active.with.name}
                {active.with.verified && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified" />}
              </p>
              <p className="text-[12px] text-muted">{active.with.online ? "Online now" : "Usually replies within a few hours"}</p>
            </div>
            {active.with.shopSlug && (
              <Link
                href={routes.shop(active.with.shopSlug)}
                className="hidden h-9 items-center rounded-full border border-line-strong px-4 text-[13px] font-semibold text-ink hover:border-ink sm:inline-flex"
              >
                View shop
              </Link>
            )}
          </header>

          {/* Which ad */}
          <Link href={routes.listing(active.listing.slug)} className="flex items-center gap-3 border-b border-line bg-cream px-4 py-2.5 hover:bg-stone md:px-5">
            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-stone">
              {active.listing.images[0]?.src && <Image src={active.listing.images[0].src} alt="" fill sizes="44px" className="object-cover" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium text-ink">{active.listing.title}</span>
              <span className="text-[13px] font-semibold text-mountain">
                Rs {formatNumber(active.listing.price.amount)}
                {active.listing.price.unit && <span className="font-normal text-muted"> / {unitLabel(active.listing.price.unit)}</span>}
              </span>
            </span>
            <span className="shrink-0 text-[12.5px] font-semibold text-mountain">View ad</span>
          </Link>

          {/* Messages */}
          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfaf7] px-4 py-5 md:px-6">
            <p className="mx-auto mb-5 flex max-w-md items-start gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[12px] leading-relaxed text-muted ring-1 ring-line">
              <ShieldCheck className="mt-px size-4 shrink-0 text-success" aria-hidden />
              Meet in a public place and check the item before you pay. Never share OTP codes.
            </p>
            <ol className="space-y-2">
              {active.messages.map((m, i) => {
                const prev = active.messages[i - 1];
                const newDay = !prev || dayKey(prev.at) !== dayKey(m.at);
                const mine = m.from === "me";
                return (
                  <li key={m.id}>
                    {newDay && (
                      <p className="my-4 text-center text-[11.5px] font-medium text-muted">
                        {dayKey(m.at) === dayKey(new Date().toISOString()) ? "Today" : dayFmt.format(new Date(m.at))}
                      </p>
                    )}
                    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      {m.offer ? (
                        <div className={cn("w-[240px] rounded-2xl p-4 ring-1", mine ? "bg-mint ring-mountain/15" : "bg-white ring-line")}>
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                            <HandCoins className="size-4 text-gold-ink" aria-hidden /> {mine ? "Your offer" : "Offer"}
                          </p>
                          <p className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-ink">Rs {formatNumber(m.offer)}</p>
                          <p className="text-[11.5px] text-muted">
                            Asking Rs {formatNumber(active.listing.price.amount)} · {timeFmt.format(new Date(m.at))}
                          </p>
                          {!mine && active.role === "selling" && (
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => send(`Deal! Rs ${formatNumber(m.offer!)} is fine. When can you come?`)}
                                className="h-9 rounded-full bg-mountain text-[12.5px] font-semibold text-white"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setOfferOpen(true)}
                                className="h-9 rounded-full border border-line-strong bg-white text-[12.5px] font-semibold text-ink"
                              >
                                Counter
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed",
                            mine ? "rounded-br-md bg-mountain text-white" : "rounded-bl-md bg-white text-ink ring-1 ring-line",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10.5px]", mine ? "text-white/70" : "text-muted")}>
                            {timeFmt.format(new Date(m.at))}
                            {mine && (m.id.startsWith("local-") ? <Check className="size-3.5 opacity-60" aria-label="Sending" /> : m.read === false ? <Check className="size-3.5" aria-label="Sent" /> : <CheckCheck className="size-3.5" aria-label="Read" />)}
                          </p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
            <div ref={endRef} />
          </div>

          {/* Compose */}
          {active.notice ? (
            <div className="border-t border-line bg-gold-wash px-4 py-4 text-center text-[13.5px] text-gold-ink md:px-5">
              {active.notice}{" "}
              <Link href={routes.listing(active.listing.slug)} className="font-semibold underline underline-offset-4">
                Back to the ad
              </Link>
            </div>
          ) : (
          <div className="border-t border-line bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 md:px-5">
            {sendError && <p role="alert" className="mb-2 rounded-lg bg-urgent-wash px-3 py-2 text-[12.5px] font-medium text-urgent">{sendError}</p>}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2.5">
              {QUICK[active.role].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => send(t)}
                  className="h-8 shrink-0 rounded-full border border-line-strong bg-white px-3 text-[12.5px] font-medium text-ink/85 hover:border-ink"
                >
                  {t}
                </button>
              ))}
            </div>

            {offerOpen && (
              <form onSubmit={sendOffer} className="mb-2.5 flex items-center gap-2 rounded-xl bg-cream p-2">
                <span className="pl-2 text-[13px] font-semibold text-muted">Rs</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={formatNumber(Math.round(active.listing.price.amount * 0.92))}
                  aria-label="Offer amount"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-white px-3 text-[14px] outline-none focus:border-mountain"
                />
                <button type="submit" className="h-9 rounded-full bg-ink px-4 text-[13px] font-semibold text-white">
                  Send offer
                </button>
                <button type="button" onClick={() => setOfferOpen(false)} aria-label="Cancel offer" className="grid size-9 place-items-center rounded-full hover:bg-stone">
                  <X className="size-4" aria-hidden />
                </button>
              </form>
            )}

            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setOfferOpen((v) => !v)}
                aria-label="Make an offer"
                title="Make an offer"
                className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-gold-ink hover:border-ink"
              >
                <HandCoins className="size-5" aria-hidden />
              </button>
              <label className="sr-only" htmlFor="chat-input">
                Message
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Write a message…"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-line-strong bg-cream px-4 py-2.5 text-[14.5px] leading-relaxed outline-none placeholder:text-muted focus:border-mountain focus:bg-white"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send"
                className="grid size-11 shrink-0 place-items-center rounded-full bg-mountain text-white transition-colors hover:bg-mountain-hover disabled:bg-line-strong"
              >
                <SendHorizontal className="size-5" aria-hidden />
              </button>
            </form>
          </div>
          )}
        </section>
      ) : (
        <div className="hidden flex-col items-center justify-center p-10 text-center lg:flex">
          <span className="grid size-16 place-items-center rounded-full bg-mint text-mountain">
            <MessageSquareText className="size-7" aria-hidden />
          </span>
          <p className="mt-4 text-[17px] font-semibold text-ink">Pick a chat</p>
          <p className="mt-1 max-w-xs text-[14px] text-muted">Choose a conversation on the left, or message a seller from any ad.</p>
          <Link href="/search" className="mt-5 inline-flex h-10 items-center rounded-full border border-line-strong px-5 text-[13.5px] font-semibold text-ink hover:border-ink">
            Browse ads
          </Link>
        </div>
      )}
    </div>
  );
}
