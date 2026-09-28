"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Bell, Megaphone, Save, Send, Smartphone, Truck, Users } from "lucide-react";
import type { AdminBroadcast } from "@/lib/admin/types";
import { DISTRICT_NAME, DISTRICT_OPTIONS, compact } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { ConfirmDialog } from "../ui/overlay";
import { Btn, Panel, Switch } from "../ui/primitives";
import { When } from "../ui/when";

const ICONS = [Truck, BadgeCheck, Smartphone];
const DEFAULT_ITEMS = [
  { title: "Delivery from verified shops", sub: "Dry fruits, honey, crafts & more", href: "/search?delivery=1" },
  { title: "Sellers you can trust", sub: "Phone & ID checked", href: "/help/safety" },
  { title: "Post an ad in 2 minutes", sub: "Free for everyone in GB", href: "/sell" },
];

const AUDIENCE: { key: AdminBroadcast["audience"]; label: string; note: string }[] = [
  { key: "everyone", label: "Everyone", note: "All users with the app or SMS on" },
  { key: "sellers", label: "Sellers", note: "Anyone with an ad" },
  { key: "shops", label: "Shop owners", note: "Verified shops only" },
  { key: "buyers", label: "Buyers", note: "People with no ads" },
];

const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

export function AnnouncementsModule({ history, reach }: { history: AdminBroadcast[]; reach: Record<AdminBroadcast["audience"], number> }) {
  const { admin, add, patch, patchesFor, ready } = useAdmin();
  const sent = useRows("announcements", history);

  /* ---------- Site banner ---------- */
  const saved = patchesFor("announcements").banner as { items?: typeof DEFAULT_ITEMS; notice?: string; noticeOn?: boolean } | undefined;
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [notice, setNotice] = useState("");
  const [noticeOn, setNoticeOn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  if (ready && !loaded) {
    setLoaded(true);
    if (saved?.items) setItems(saved.items);
    if (saved?.notice) setNotice(saved.notice);
    if (saved?.noticeOn) setNoticeOn(saved.noticeOn);
  }

  /* ---------- Notification ---------- */
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<AdminBroadcast["audience"]>("everyone");
  const [district, setDistrict] = useState<string>("all");
  const [confirm, setConfirm] = useState(false);

  const estimate = useMemo(() => Math.round(reach[audience] * (district === "all" ? 1 : 0.14)), [reach, audience, district]);
  const canSend = title.trim().length >= 4 && body.trim().length >= 8;

  const history_ = [...sent].sort((a, b) => +new Date(b.sentAt) - +new Date(a.sentAt));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Notification composer */}
      <Panel title={<h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Bell className="size-4 text-mountain" aria-hidden /> Send a notification</h2>}>
        <div className="space-y-4">
          <div>
            <label htmlFor="n-title" className="text-[13px] font-semibold text-ink">
              Title
            </label>
            <input id="n-title" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New crop apricots are here" className={cn(inputCls, "mt-1.5")} />
            <p className="mt-1 text-right text-[11.5px] text-muted">{title.length}/60</p>
          </div>
          <div>
            <label htmlFor="n-body" className="text-[13px] font-semibold text-ink">
              Message
            </label>
            <textarea
              id="n-body"
              rows={3}
              maxLength={160}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Short and useful. One SMS is 160 characters."
              className={cn(inputCls, "mt-1.5 h-auto resize-none py-2.5")}
            />
            <p className="mt-1 text-right text-[11.5px] text-muted">{body.length}/160</p>
          </div>

          <fieldset>
            <legend className="text-[13px] font-semibold text-ink">Who gets it</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AUDIENCE.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  aria-pressed={audience === a.key}
                  onClick={() => setAudience(a.key)}
                  className={cn("rounded-xl border p-3 text-left transition-colors", audience === a.key ? "border-mountain bg-mint/60" : "border-line-strong hover:border-ink/30")}
                >
                  <span className="block text-[13.5px] font-semibold text-ink">{a.label}</span>
                  <span className="block text-[12px] text-muted">{a.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="n-district" className="text-[13px] font-semibold text-ink">
              District
            </label>
            <select id="n-district" value={district} onChange={(e) => setDistrict(e.target.value)} className={cn(inputCls, "mt-1.5")}>
              <option value="all">All of Gilgit-Baltistan</option>
              {DISTRICT_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Phone preview */}
          <div className="rounded-2xl bg-[linear-gradient(160deg,#1c2a24,#0e1713)] p-4">
            <p className="mb-2 text-center text-[11px] font-medium text-white/50">Preview</p>
            <div className="mx-auto flex max-w-sm gap-3 rounded-2xl bg-white/95 p-3 shadow-lg">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-mountain">
                <svg viewBox="0 0 40 40" className="size-6" aria-hidden>
                  <path d="M6 29 L15.5 16.5 L20 22 L25.5 12.5 L34 29" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="flex items-center justify-between gap-2 text-[11px] text-muted">
                  <span className="font-semibold uppercase tracking-wide">REGOMARKET</span> now
                </span>
                <span className="block truncate text-[13.5px] font-semibold text-ink">{title || "Notification title"}</span>
                <span className="line-clamp-2 block text-[12.5px] text-ink/75">{body || "Your message appears here."}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-[13px] text-muted">
              <Users className="size-4" aria-hidden /> About <span className="font-semibold text-ink">{compact(estimate)}</span> people
            </p>
            <Btn tone="primary" disabled={!canSend} onClick={() => setConfirm(true)}>
              <Send /> Send
            </Btn>
          </div>
        </div>
      </Panel>

      <div className="space-y-6">
        {/* Site banner */}
        <Panel
          title={<h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><Megaphone className="size-4 text-mountain" aria-hidden /> Site banner</h2>}
          action={
            <Btn
              size="sm"
              tone="primary"
              onClick={() =>
                patch("announcements", "banner", { items, notice, noticeOn }, { action: "Updated site banner", target: noticeOn && notice ? notice : "Banner items", toast: "Banner saved", undoable: false })
              }
            >
              <Save /> Save
            </Btn>
          }
        >
          {/* Preview */}
          <div className="overflow-hidden rounded-xl">
            {noticeOn && notice && <p className="bg-gold px-3 py-2 text-center text-[12.5px] font-semibold text-[#2b1d05]">{notice}</p>}
            <ul className="grid grid-cols-1 bg-forest text-white sm:grid-cols-3">
              {items.map((it, i) => {
                const I = ICONS[i];
                return (
                  <li key={i} className={cn("flex h-10 items-center justify-center gap-2 px-2 text-[12px]", i > 0 && "hidden border-white/10 sm:flex sm:border-l")}>
                    <I className="size-4 shrink-0 text-gold-soft" aria-hidden />
                    <span className="truncate font-semibold">{it.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 space-y-3">
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <input aria-label={`Item ${i + 1} title`} value={it.title} onChange={(e) => setItems((x) => x.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} className={cn(inputCls, "h-10")} />
                <input aria-label={`Item ${i + 1} link`} value={it.href} onChange={(e) => setItems((x) => x.map((y, j) => (j === i ? { ...y, href: e.target.value } : y)))} className={cn(inputCls, "h-10 font-mono text-[12.5px]")} />
              </div>
            ))}
            <div className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-[13.5px] font-semibold text-ink">Special notice</span>
                  <span className="block text-[12px] text-muted">A gold line above the banner — e.g. holidays or outages</span>
                </span>
                <Switch checked={noticeOn} onChange={setNoticeOn} label="Special notice" />
              </div>
              {noticeOn && (
                <input value={notice} onChange={(e) => setNotice(e.target.value)} maxLength={90} placeholder="Eid holidays: new ads are checked a little slower until Monday." className={cn(inputCls, "mt-3 h-10")} />
              )}
            </div>
            <p className="text-[12px] text-muted">Saved here for now. It shows on the live site once the site settings table in Supabase is connected.</p>
          </div>
        </Panel>

        {/* History */}
        <Panel title="Sent" bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {history_.map((b) => (
              <li key={b.id} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[14px] font-semibold text-ink">{b.title}</p>
                  <When iso={b.sentAt} className="shrink-0 text-[12px] text-muted" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-muted">{b.body}</p>
                <p className="mt-1 text-[12px] text-muted">
                  {AUDIENCE.find((a) => a.key === b.audience)?.label} · {b.district && b.district !== "all" ? DISTRICT_NAME[b.district] : "All GB"} · {compact(b.reach)} reached · by {b.by.split(" ")[0]}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Send this notification?"
        body={
          <>
            “{title}” goes to about <span className="font-semibold text-ink">{compact(estimate)}</span> people. This can’t be undone.
          </>
        }
        confirmLabel="Send now"
        onConfirm={() => {
          add(
            "announcements",
            { id: `bc-${Date.now()}`, title: title.trim(), body: body.trim(), audience, district, sentAt: new Date().toISOString(), reach: estimate, by: admin.name },
            { action: "Sent notification", target: title.trim(), toast: "Notification sent" },
          );
          setTitle("");
          setBody("");
        }}
      />
    </div>
  );
}
