"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ban, BadgeCheck, ExternalLink, Eye, Flag, MessageSquareText, PauseCircle, PlayCircle, Phone, Store, Tag, Users } from "lucide-react";
import type { AdminUser } from "@/lib/admin/types";
import { DISTRICT_OPTIONS, place } from "@/lib/admin/labels";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { DataTable, type Column } from "../ui/data-table";
import { Drawer, Modal, ReasonDialog } from "../ui/overlay";
import { Avatar, Btn, Facts, Tag as Chip } from "../ui/primitives";
import { StatusPill } from "../ui/status-pill";
import { When } from "../ui/when";

const SUSPEND = ["Asking for advance payment", "Fake or misleading ads", "Abusive messages", "Many buyer complaints", "Selling banned items"];
const BAN = ["Scam confirmed", "Fake identity", "Repeated rule breaking after suspension", "Threats or harassment"];

const TYPE_LABEL: Record<AdminUser["type"], string> = { individual: "Seller", shop: "Shop", buyer: "Buyer" };

function Levels({ v }: { v: AdminUser["verifications"] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {v.includes("identity") && <Chip tone="green">ID</Chip>}
      {v.includes("business") && <Chip tone="green">Business</Chip>}
      {v.includes("rego") && <Chip tone="gold">REGO</Chip>}
      {!v.includes("identity") && !v.includes("business") && <Chip>{v.includes("phone") ? "Phone only" : "None"}</Chip>}
    </span>
  );
}

export function UsersModule({ initial, query }: { initial: AdminUser[]; query: { q?: string; tab?: string } }) {
  const { patch } = useAdmin();
  const rows = useRows("users", initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [ask, setAsk] = useState<{ kind: "suspend" | "ban"; users: AdminUser[] } | null>(null);
  const [msgFor, setMsgFor] = useState<AdminUser | null>(null);
  const [msg, setMsg] = useState("");
  const [shown, setShown] = useState<Set<string>>(new Set());
  const open = rows.find((r) => r.id === openId) ?? null;

  const reactivate = (u: AdminUser) =>
    patch("users", u.id, { status: "active", reason: undefined }, { action: "Reactivated user", target: u.name, toast: `${u.name} can use REGOMARKET again` });

  const columns = useMemo<Column<AdminUser>[]>(
    () => [
      {
        key: "user",
        header: "User",
        sort: (r) => r.name.toLowerCase(),
        cell: (r) => (
          <div className="flex min-w-[200px] items-center gap-3">
            <Avatar name={r.name} />
            <div className="min-w-0">
              <p className="flex items-center gap-1 truncate font-semibold text-ink">
                {r.name}
                {(r.verifications.includes("identity") || r.verifications.includes("business")) && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified" />}
              </p>
              <p className="text-[12px] tabular-nums text-muted">{r.phone}</p>
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        sort: (r) => r.type,
        cell: (r) => (
          <span className="inline-flex items-center gap-1 text-ink/85">
            {r.type === "shop" && <Store className="size-3.5 text-muted" aria-hidden />}
            {TYPE_LABEL[r.type]}
          </span>
        ),
      },
      { key: "place", header: "Location", hideBelow: "xl", sort: (r) => r.district, cell: (r) => <span className="whitespace-nowrap text-muted">{place(r.district, r.town)}</span> },
      { key: "ver", header: "Checks", hideBelow: "lg", cell: (r) => <Levels v={r.verifications} /> },
      { key: "ads", header: "Ads", align: "right", sort: (r) => r.ads, cell: (r) => <span className="tabular-nums">{r.ads}</span> },
      {
        key: "reports",
        header: "Reports",
        align: "right",
        sort: (r) => r.reports,
        cell: (r) => <span className={cn("tabular-nums", r.reports ? "font-semibold text-urgent" : "text-muted")}>{r.reports}</span>,
      },
      { key: "joined", header: "Joined", hideBelow: "xl", sort: (r) => +new Date(r.joinedAt), cell: (r) => <span className="whitespace-nowrap text-muted">{new Date(r.joinedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span> },
      { key: "seen", header: "Last seen", hideBelow: "lg", sort: (r) => +new Date(r.lastActive), cell: (r) => <When iso={r.lastActive} className="whitespace-nowrap text-muted" /> },
      { key: "status", header: "Status", sort: (r) => r.status, cell: (r) => <StatusPill status={r.status} label={r.status === "active" ? "Active" : undefined} /> },
    ],
    [],
  );

  return (
    <>
      <DataTable
        rows={rows}
        getId={(r) => r.id}
        columns={columns}
        initialTab={query.tab ?? "all"}
        initialQuery={query.q}
        tabs={[
          { key: "all", label: "All", filter: () => true },
          { key: "sellers", label: "Sellers", filter: (r) => r.type === "individual" },
          { key: "shops", label: "Shop owners", filter: (r) => r.type === "shop" },
          { key: "buyers", label: "Buyers", filter: (r) => r.type === "buyer" },
          { key: "reported", label: "Reported", filter: (r) => r.reports > 0 },
          { key: "blocked", label: "Suspended / banned", filter: (r) => r.status !== "active" },
        ]}
        search={(r) => `${r.name} ${r.phone} ${r.id} ${r.town ?? ""}`}
        searchPlaceholder="Search name, phone or ID"
        facets={[
          { key: "district", label: "District", options: DISTRICT_OPTIONS, get: (r) => r.district },
          {
            key: "ver",
            label: "Checks",
            options: [
              { value: "id", label: "ID verified" },
              { value: "none", label: "Not verified" },
            ],
            get: (r) => (r.verifications.includes("identity") || r.verifications.includes("business") ? "id" : "none"),
          },
        ]}
        bulk={[{ label: "Suspend", icon: PauseCircle, tone: "danger", run: (list) => setAsk({ kind: "suspend", users: list }) }]}
        onRowClick={(r) => setOpenId(r.id)}
        rowClassName={(r) => (r.status !== "active" ? "opacity-70" : undefined)}
        mobile={(r) => (
          <div className="flex items-center gap-3">
            <Avatar name={r.name} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{r.name}</p>
              <p className="truncate text-[12.5px] text-muted">
                {TYPE_LABEL[r.type]} · {place(r.district, r.town)} · {r.ads} ads
              </p>
            </div>
            <StatusPill status={r.status} label={r.status === "active" ? "Active" : undefined} />
          </div>
        )}
        empty={{ title: "No users found", icon: <Users /> }}
      />

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpenId(null)}
        title={
          open && (
            <span className="flex items-center gap-3">
              <Avatar name={open.name} size={40} />
              <span>
                {open.name}
                <span className="block text-[12.5px] font-normal text-muted">
                  {TYPE_LABEL[open.type]} · joined {new Date(open.joinedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </span>
              </span>
            </span>
          )
        }
        footer={
          open && (
            <>
              <Btn className="mr-auto" onClick={() => setMsgFor(open)}>
                <MessageSquareText /> Message
              </Btn>
              {open.status === "active" ? (
                <>
                  <Btn tone="danger-soft" onClick={() => setAsk({ kind: "suspend", users: [open] })}>
                    <PauseCircle /> Suspend
                  </Btn>
                  <Btn tone="danger" onClick={() => setAsk({ kind: "ban", users: [open] })}>
                    <Ban /> Ban
                  </Btn>
                </>
              ) : (
                <Btn tone="primary" onClick={() => reactivate(open)}>
                  <PlayCircle /> Reactivate
                </Btn>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-5">
            {open.status !== "active" && (
              <div className="rounded-xl border border-[#efcfc7] bg-urgent-wash p-4 text-[13.5px]">
                <p className="font-semibold text-urgent">{open.status === "banned" ? "Banned" : "Suspended"}</p>
                {open.reason && <p className="mt-1 text-ink/85">{open.reason}</p>}
              </div>
            )}

            <Facts
              items={[
                [
                  "Phone",
                  <span key="ph" className="inline-flex items-center gap-2 tabular-nums">
                    {open.phone}
                    {!shown.has(open.id) ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShown((s) => new Set(s).add(open.id));
                          patch("users", open.id, {}, { action: "Viewed phone number", target: open.name });
                        }}
                        className="inline-flex items-center gap-1 text-[12px] font-semibold text-mountain hover:underline"
                      >
                        <Eye className="size-3.5" aria-hidden /> Show
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] text-muted">
                        <Phone className="size-3" aria-hidden /> view logged
                      </span>
                    )}
                  </span>,
                ],
                ["Location", place(open.district, open.town)],
                ["Checks", <Levels key="l" v={open.verifications} />],
                ["Ads", open.ads],
                ["Completed deals", open.deals],
                ["Reports against", open.reports ? <span key="r" className="font-semibold text-urgent">{open.reports}</span> : "None"],
                ["Last seen", <When key="w" iso={open.lastActive} />],
              ]}
            />
            {shown.has(open.id) && (
              <p className="text-[12px] text-muted">With Supabase connected the full number shows here (read with the <code>reveal_phone</code> check), and every view is saved in the activity log.</p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link href={`/admin/listings?q=${encodeURIComponent(open.name)}`} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px] font-semibold text-ink hover:border-mountain/40">
                <Tag className="size-4 text-mountain" aria-hidden /> Their ads
              </Link>
              <Link href={`/admin/reports?q=${encodeURIComponent(open.name)}`} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px] font-semibold text-ink hover:border-mountain/40">
                <Flag className="size-4 text-mountain" aria-hidden /> Reports
              </Link>
              {open.type !== "buyer" && (
                <Link href={`/seller/${open.id}`} target="_blank" className="col-span-2 flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-[13.5px] font-semibold text-ink hover:border-mountain/40">
                  <ExternalLink className="size-4 text-mountain" aria-hidden /> Public profile
                </Link>
              )}
            </div>
          </div>
        )}
      </Drawer>

      <ReasonDialog
        open={ask?.kind === "suspend"}
        onClose={() => setAsk(null)}
        title={ask && ask.users.length > 1 ? `Suspend ${ask.users.length} users?` : `Suspend ${ask?.users[0]?.name ?? "user"}?`}
        intro="They can't post, message or order until you reactivate them. Their ads are hidden."
        reasons={SUSPEND}
        confirmLabel="Suspend"
        onConfirm={(reason) =>
          ask &&
          patch("users", ask.users.map((u) => u.id), { status: "suspended", reason }, { action: "Suspended user", target: ask.users.map((u) => u.name).join(", "), detail: reason, toast: "Suspended", tone: "danger" })
        }
      />
      <ReasonDialog
        open={ask?.kind === "ban"}
        onClose={() => setAsk(null)}
        title={`Ban ${ask?.users[0]?.name ?? "user"}?`}
        intro="A ban is for confirmed scams and serious abuse. Their phone number can't sign up again."
        reasons={BAN}
        confirmLabel="Ban user"
        onConfirm={(reason) =>
          ask && patch("users", ask.users.map((u) => u.id), { status: "banned", reason }, { action: "Banned user", target: ask.users[0].name, detail: reason, toast: "User banned", tone: "danger" })
        }
      />
      <Modal
        open={Boolean(msgFor)}
        onClose={() => setMsgFor(null)}
        title={`Message ${msgFor?.name ?? ""}`}
        footer={
          <>
            <Btn onClick={() => setMsgFor(null)}>Cancel</Btn>
            <Btn
              tone="primary"
              disabled={!msg.trim()}
              onClick={() => {
                if (msgFor) patch("users", msgFor.id, {}, { action: "Sent message", target: msgFor.name, detail: msg.trim().slice(0, 80), toast: "Message sent", undoable: false });
                setMsg("");
                setMsgFor(null);
              }}
            >
              Send
            </Btn>
          </>
        }
      >
        <p className="text-[13px] text-muted">Arrives as a notification from “REGOMARKET Team”.</p>
        <textarea
          rows={4}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          aria-label="Message"
          placeholder="Salam, …"
          className="mt-3 w-full resize-none rounded-xl border border-line-strong px-3.5 py-2.5 text-[14px] outline-none focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]"
        />
      </Modal>
    </>
  );
}
