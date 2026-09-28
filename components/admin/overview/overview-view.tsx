"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, CheckCircle2, Clock, X } from "lucide-react";
import type { AdminListing, AuditEntry, OverviewData } from "@/lib/admin/types";
import { ADMIN_MODULES, moduleByKey, type ModuleKey } from "@/lib/admin/modules";
import { CATEGORY_NAME, compact, place, rs } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { BarList, Sparkline, TrendChart } from "../ui/charts";
import { Panel, Thumb } from "../ui/primitives";
import { ReasonDialog } from "../ui/overlay";
import { When } from "../ui/when";
import { REJECT_AD_REASONS } from "../listings/reasons";

const ATTENTION: { key: ModuleKey; text: (n: number) => string; href: string }[] = [
  { key: "listings", text: (n) => `${n} ad${n === 1 ? "" : "s"} waiting for approval`, href: "/admin/listings?tab=pending" },
  { key: "verifications", text: (n) => `${n} CNIC / business check${n === 1 ? "" : "s"}`, href: "/admin/verifications" },
  { key: "reports", text: (n) => `${n} open report${n === 1 ? "" : "s"}`, href: "/admin/reports" },
  { key: "shops", text: (n) => `${n} shop application${n === 1 ? "" : "s"}`, href: "/admin/shops?tab=pending" },
  { key: "orders", text: (n) => `${n} new order${n === 1 ? "" : "s"} not yet confirmed`, href: "/admin/orders" },
  { key: "reviews", text: (n) => `${n} flagged review${n === 1 ? "" : "s"}`, href: "/admin/reviews" },
  { key: "inbox", text: (n) => `${n} unread message${n === 1 ? "" : "s"}`, href: "/admin/inbox" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function OverviewView({ data, pending, log, firstName }: { data: OverviewData; pending: AdminListing[]; log: AuditEntry[]; firstName: string }) {
  const { queueCount, ready, patch, log: localLog } = useAdmin();
  const [metric, setMetric] = useState<"ads" | "users">("ads");
  const [rejecting, setRejecting] = useState<AdminListing | null>(null);
  const rows = useRows("listings", pending);
  const waitingAds = rows.filter((r) => r.status === "pending");

  const attention = ATTENTION.map((a) => ({ ...a, n: ready ? queueCount(a.key) ?? 0 : 0 })).filter((a) => a.n > 0);
  const activity = useMemo(() => [...localLog, ...log].sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 7), [localLog, log]);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const approve = (l: AdminListing) =>
    patch("listings", l.id, { status: "active" }, { action: "Approved ad", target: l.title, toast: `Approved “${l.title}”` });

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[13px] font-medium text-muted" suppressHydrationWarning>
            {today}
          </p>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]" suppressHydrationWarning>
            {greeting()}, {firstName}
          </h1>
        </div>
        <p className="text-[13.5px] text-muted">
          {ready && attention.length ? (
            <>
              <span className="font-semibold text-ink">{attention.reduce((n, a) => n + a.n, 0)} things</span> need you today
            </>
          ) : ready ? (
            "Everything is up to date"
          ) : (
            " "
          )}
        </p>
      </div>

      {/* KPIs */}
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((k) => {
          const up = k.delta >= 0;
          return (
            <div key={k.key} className="rounded-2xl border border-line bg-white p-4">
              <dt className="text-[13px] font-medium text-muted">{k.label}</dt>
              <dd className="mt-2 flex items-end justify-between gap-3">
                <span>
                  <span className="block text-[26px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">
                    {k.format === "rs" ? `Rs ${compact(k.value)}` : compact(k.value)}
                  </span>
                  <span className={cn("mt-2 inline-flex items-center gap-0.5 text-[12.5px] font-semibold", up ? "text-success" : "text-urgent")}>
                    {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
                    {Math.abs(k.delta)}%<span className="ml-1 font-normal text-muted">vs last week</span>
                  </span>
                </span>
                <Sparkline values={k.series.slice(-14)} />
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          {/* Trend */}
          <Panel
            title={
              <div>
                <h2 className="text-[15px] font-semibold text-ink">{metric === "ads" ? "Ads posted" : "New users"} per day</h2>
                <p className="text-[12.5px] text-muted">Last 30 days</p>
              </div>
            }
            action={
              <div role="radiogroup" aria-label="Metric" className="flex rounded-lg bg-stone p-0.5">
                {(["ads", "users"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={metric === m}
                    onClick={() => setMetric(m)}
                    className={cn("h-8 rounded-md px-3 text-[12.5px] font-semibold", metric === m ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink")}
                  >
                    {m === "ads" ? "Ads" : "Users"}
                  </button>
                ))}
              </div>
            }
          >
            <TrendChart label={metric === "ads" ? "Ads posted" : "New users"} points={data.daily.map((d) => ({ date: d.date, value: d[metric] }))} />
          </Panel>

          {/* Approval queue preview */}
          <Panel
            title={
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                Waiting for approval
                {ready && waitingAds.length > 0 && <span className="rounded-full bg-gold-wash px-2 py-0.5 text-[12px] font-semibold text-gold-ink">{waitingAds.length}</span>}
              </h2>
            }
            action={
              <Link href="/admin/listings?tab=pending" className="inline-flex items-center gap-1 text-[13px] font-semibold text-mountain hover:underline">
                All ads <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
            bodyClassName="p-0"
          >
            {waitingAds.length === 0 ? (
              <p className="flex items-center gap-2 px-5 py-6 text-[14px] text-muted">
                <CheckCircle2 className="size-5 text-success" aria-hidden /> No ads waiting. Nice work.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {waitingAds.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                    <Thumb src={l.image} size={52} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/listings?tab=pending&open=${l.id}`} className="block truncate text-[14px] font-semibold text-ink hover:underline">
                        {l.title}
                      </Link>
                      <p className="truncate text-[12.5px] text-muted">
                        {rs(l.price)} · {CATEGORY_NAME[l.category]} · {place(l.district, l.town)} · <When iso={l.postedAt} />
                      </p>
                      {l.flags.length > 0 && <p className="mt-0.5 truncate text-[12px] font-medium text-urgent">⚑ {l.flags.join(" · ")}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button type="button" onClick={() => setRejecting(l)} aria-label={`Reject ${l.title}`} className="grid size-9 place-items-center rounded-lg border border-line-strong text-urgent hover:bg-urgent-wash">
                        <X className="size-4" />
                      </button>
                      <button type="button" onClick={() => approve(l)} aria-label={`Approve ${l.title}`} className="grid size-9 place-items-center rounded-lg bg-success text-white hover:bg-[#0f5c3f]">
                        <Check className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Live ads by category">
              <BarList items={data.byCategory.slice(0, 8).map((c) => ({ key: c.slug, label: c.name, value: c.ads, href: `/admin/listings?category=${c.slug}` }))} />
            </Panel>
            <Panel title="Live ads by district">
              <BarList items={data.byDistrict.slice(0, 8).map((d) => ({ key: d.slug, label: d.name, value: d.ads, href: `/admin/listings?district=${d.slug}` }))} />
            </Panel>
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-6">
          <Panel title="Needs attention" bodyClassName="p-2">
            {!ready ? (
              <div className="h-40" />
            ) : attention.length === 0 ? (
              <p className="flex items-center gap-2 px-3 py-4 text-[14px] text-muted">
                <CheckCircle2 className="size-5 text-success" aria-hidden /> All clear
              </p>
            ) : (
              <ul>
                {attention.map((a) => {
                  const m = moduleByKey[a.key];
                  return (
                    <li key={a.key}>
                      <Link href={a.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#fbfaf6]">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gold-wash text-gold-ink">
                          <m.icon className="size-[18px]" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1 text-[13.5px] font-medium text-ink">{a.text(a.n)}</span>
                        <ArrowRight className="size-4 text-muted" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel
            title="Recent activity"
            action={
              <Link href="/admin/activity" className="text-[13px] font-semibold text-mountain hover:underline">
                See all
              </Link>
            }
          >
            <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-line">
              {activity.map((e) => {
                const m = ADMIN_MODULES.find((x) => x.key === e.module);
                const Icon = m?.icon ?? Clock;
                return (
                  <li key={e.id} className="relative flex gap-3">
                    <span className="relative z-[1] grid size-8 shrink-0 place-items-center rounded-full border border-line bg-white text-ink/70">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 pt-0.5 text-[13px]">
                      <p className="text-ink">
                        <span className="font-semibold">{e.by.split(" ")[0]}</span> {e.action.toLowerCase()}{" "}
                        <span className="font-medium">{e.target}</span>
                      </p>
                      <p className="text-[12px] text-muted">
                        <When iso={e.at} />
                        {e.detail ? ` · ${e.detail}` : ""}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          <Panel title="Shortcuts" bodyClassName="grid grid-cols-2 gap-2 p-3">
            {(["announcements", "categories", "blog", "settings"] as ModuleKey[]).map((k) => {
              const m = moduleByKey[k];
              return (
                <Link key={k} href={m.href} className="flex flex-col gap-2 rounded-xl border border-line p-3 hover:border-mountain/40 hover:bg-mint/40">
                  <m.icon className="size-5 text-mountain" aria-hidden />
                  <span className="text-[13px] font-semibold text-ink">{m.label}</span>
                </Link>
              );
            })}
          </Panel>
        </div>
      </div>

      <ReasonDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        title="Reject this ad?"
        intro={rejecting ? <>“{rejecting.title}” will not go live. The seller gets your reason by SMS and in the app.</> : null}
        reasons={REJECT_AD_REASONS}
        confirmLabel="Reject ad"
        onConfirm={(reason) =>
          rejecting &&
          patch("listings", rejecting.id, { status: "rejected", reason }, { action: "Rejected ad", target: rejecting.title, detail: reason, toast: "Ad rejected", tone: "danger" })
        }
      />
    </div>
  );
}
