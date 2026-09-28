"use client";

import { useState, type ReactNode } from "react";
import { Building2, KeyRound, RotateCcw, Save, ShieldCheck, SlidersHorizontal, Trash2, UserPlus, Users } from "lucide-react";
import type { AdminRole, AdminTeamMember } from "@/lib/admin/types";
import { ROLE_LABEL, ROLE_NOTE } from "@/lib/admin/modules";
import { cn } from "@/lib/utils";
import { useAdmin, useRows } from "../store";
import { ConfirmDialog, Modal } from "../ui/overlay";
import { Avatar, Btn, Switch } from "../ui/primitives";
import { When } from "../ui/when";

const inputCls =
  "h-11 w-full rounded-xl border border-line-strong bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]";

const DEFAULTS = {
  siteName: "REGOMARKET",
  phone: "+92 355 0000000",
  whatsapp: "+92 355 0000000",
  email: "support@regomarket.pk",
  address: "Jutial, Gilgit",
  autoApproveVerified: true,
  idForProperty: true,
  ordersEnabled: true,
  wantedEnabled: true,
  freeAds: 10,
  expiryDays: 60,
  bannedWords: "advance payment, send money first, jazzcash first, token money",
};

type Settings = typeof DEFAULTS;

const SECTIONS = [
  { id: "general", label: "Site details", icon: Building2 },
  { id: "rules", label: "Marketplace rules", icon: SlidersHorizontal },
  { id: "team", label: "Admin team", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function Row({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-ink">{title}</p>
        {note && <p className="text-[12.5px] text-muted">{note}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsModule({ team: initialTeam, adminMode }: { team: AdminTeamMember[]; adminMode: "open" | "ready" | "locked" }) {
  const { admin, patch, add, patchesFor, ready, reset } = useAdmin();
  const team = useRows("settings", initialTeam);
  const saved = patchesFor("settings").site as Partial<Settings> | undefined;
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [invite, setInvite] = useState<{ name: string; phone: string; role: AdminRole } | null>(null);
  const [removing, setRemoving] = useState<AdminTeamMember | null>(null);
  const [resetting, setResetting] = useState(false);

  if (ready && !loaded) {
    setLoaded(true);
    if (saved) setS({ ...DEFAULTS, ...saved });
  }

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => {
    setS((x) => ({ ...x, [k]: v }));
    setDirty(true);
  };

  const saveAll = () => {
    patch("settings", "site", s, { action: "Updated settings", target: "Site settings", toast: "Settings saved", undoable: false });
    setDirty(false);
  };

  const isOwner = admin.role === "owner";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:self-start lg:px-0">
        {SECTIONS.map((x) => (
          <a key={x.id} href={`#${x.id}`} className="flex h-10 shrink-0 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium text-ink/80 hover:bg-white hover:text-ink">
            <x.icon className="size-4 text-muted" aria-hidden /> {x.label}
          </a>
        ))}
      </nav>

      <div className="min-w-0 space-y-6">
        {/* General */}
        <section id="general" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Site details</h2>
          <p className="text-[13px] text-muted">Shown in the footer, the Contact page and emails.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                ["siteName", "Site name"],
                ["email", "Support email"],
                ["phone", "Support phone"],
                ["whatsapp", "WhatsApp"],
              ] as [keyof Settings, string][]
            ).map(([k, l]) => (
              <div key={k}>
                <label htmlFor={`s-${k}`} className="text-[13px] font-semibold text-ink">
                  {l}
                </label>
                <input id={`s-${k}`} value={String(s[k])} onChange={(e) => set(k, e.target.value as never)} className={cn(inputCls, "mt-1.5")} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label htmlFor="s-address" className="text-[13px] font-semibold text-ink">
                Office address
              </label>
              <input id="s-address" value={s.address} onChange={(e) => set("address", e.target.value)} className={cn(inputCls, "mt-1.5")} />
            </div>
          </div>
        </section>

        {/* Rules */}
        <section id="rules" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Marketplace rules</h2>
          <div className="mt-2 divide-y divide-line">
            <Row title="Auto-approve verified sellers" note="Ads from ID-verified sellers go live at once. Others wait for approval.">
              <Switch checked={s.autoApproveVerified} onChange={(v) => set("autoApproveVerified", v)} label="Auto-approve verified sellers" />
            </Row>
            <Row title="ID needed for property & vehicles" note="These ads need a verified CNIC before they go live.">
              <Switch checked={s.idForProperty} onChange={(v) => set("idForProperty", v)} label="ID needed for property and vehicles" />
            </Row>
            <Row title="Online orders" note="Checkout for verified shops. Turn off to pause all orders.">
              <Switch checked={s.ordersEnabled} onChange={(v) => set("ordersEnabled", v)} label="Online orders" />
            </Row>
            <Row title="Wanted requests" note="Buyers can post what they need.">
              <Switch checked={s.wantedEnabled} onChange={(v) => set("wantedEnabled", v)} label="Wanted requests" />
            </Row>
            <Row title="Free ads per month" note="For individual sellers. Shops have no limit.">
              <input type="number" min={1} max={100} value={s.freeAds} onChange={(e) => set("freeAds", Number(e.target.value))} aria-label="Free ads per month" className={cn(inputCls, "w-28 text-right tabular-nums")} />
            </Row>
            <Row title="Ads expire after" note="Seller can renew with one tap.">
              <select value={s.expiryDays} onChange={(e) => set("expiryDays", Number(e.target.value))} aria-label="Ad expiry" className={cn(inputCls, "w-36")}>
                {[30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} days
                  </option>
                ))}
              </select>
            </Row>
          </div>
          <div className="mt-2">
            <label htmlFor="s-banned" className="text-[14px] font-semibold text-ink">
              Words that flag an ad
            </label>
            <p className="text-[12.5px] text-muted">Comma separated. Ads with these words always wait for a human, even from verified sellers.</p>
            <textarea id="s-banned" rows={3} value={s.bannedWords} onChange={(e) => set("bannedWords", e.target.value)} className={cn(inputCls, "mt-2 h-auto resize-none py-2.5")} />
          </div>
        </section>

        {/* Team */}
        <section id="team" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">Admin team</h2>
              <p className="text-[13px] text-muted">Give each person the smallest role they need.</p>
            </div>
            {isOwner && (
              <Btn size="sm" tone="primary" onClick={() => setInvite({ name: "", phone: "", role: "moderator" })}>
                <UserPlus /> Add admin
              </Btn>
            )}
          </div>
          <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
            {team.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <Avatar name={m.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">
                    {m.name} {m.you && <span className="ml-1 rounded bg-stone px-1.5 py-0.5 text-[11px] font-semibold text-muted">You</span>}
                  </p>
                  <p className="text-[12.5px] text-muted">
                    {m.phone} · active <When iso={m.lastActive} />
                  </p>
                </div>
                {m.role === "owner" || !isOwner ? (
                  <span className="rounded-lg bg-gold-wash px-2.5 py-1 text-[12.5px] font-semibold text-gold-ink">{ROLE_LABEL[m.role]}</span>
                ) : (
                  <>
                    <select
                      value={m.role}
                      aria-label={`Role for ${m.name}`}
                      onChange={(e) => patch("settings", m.id, { role: e.target.value }, { action: "Changed role", target: m.name, detail: ROLE_LABEL[e.target.value as AdminRole], toast: `${m.name} is now ${ROLE_LABEL[e.target.value as AdminRole]}` })}
                      className="h-9 rounded-lg border border-line-strong bg-white px-2.5 text-[13px]"
                    >
                      {(["admin", "moderator", "support"] as AdminRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABEL[r]}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => setRemoving(m)} aria-label={`Remove ${m.name}`} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-urgent-wash hover:text-urgent">
                      <Trash2 className="size-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(ROLE_LABEL) as AdminRole[]).map((r) => (
              <div key={r} className="rounded-xl bg-[#fbfaf6] px-4 py-3">
                <dt className="text-[13px] font-semibold text-ink">{ROLE_LABEL[r]}</dt>
                <dd className="text-[12.5px] text-muted">{ROLE_NOTE[r]}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Security */}
        <section id="security" className="scroll-mt-24 rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Security</h2>
          <div className="mt-2 divide-y divide-line">
            <Row
              title="Admin password"
              note={
                adminMode === "ready"
                  ? "Set on the server. Change it with: npx sst secret set AdminPassword … --stage production"
                  : adminMode === "open"
                    ? "Not set on this computer (development). The live site always needs one."
                    : "Not set — admin is locked on the live site."
              }
            >
              <span className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-semibold", adminMode === "ready" ? "bg-mint text-success" : "bg-gold-wash text-gold-ink")}>
                <KeyRound className="size-3.5" aria-hidden /> {adminMode === "ready" ? "Active" : adminMode === "open" ? "Dev mode" : "Locked"}
              </span>
            </Row>
            <Row title="Next step: phone login for admins" note="With Supabase Auth each admin signs in with their own phone + OTP and their role above. The shared password is then removed.">
              <span className="rounded-lg bg-stone px-2.5 py-1 text-[12.5px] font-semibold text-muted">Planned</span>
            </Row>
            <Row title="Preview data" note="Actions in this preview are saved in this browser only. Reset to start fresh.">
              <Btn size="sm" tone="danger-soft" onClick={() => setResetting(true)}>
                <RotateCcw /> Reset preview
              </Btn>
            </Row>
          </div>
        </section>

        {/* Save bar */}
        <div className={cn("sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl bg-[#0f1a15] px-4 py-3 text-white shadow-[0_24px_50px_-20px_rgb(0_0_0/0.6)] transition-all", dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0")}>
          <span className="text-[13.5px]">You have unsaved changes</span>
          <span className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setS({ ...DEFAULTS, ...saved });
                setDirty(false);
              }}
              className="h-9 rounded-lg px-3 text-[13px] font-semibold text-white/80 hover:bg-white/10"
            >
              Discard
            </button>
            <button type="button" onClick={saveAll} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gold px-4 text-[13px] font-semibold text-[#2b1d05] hover:bg-gold-soft">
              <Save className="size-4" aria-hidden /> Save
            </button>
          </span>
        </div>
      </div>

      <Modal
        open={Boolean(invite)}
        onClose={() => setInvite(null)}
        title="Add an admin"
        footer={
          <>
            <Btn onClick={() => setInvite(null)}>Cancel</Btn>
            <Btn
              tone="primary"
              disabled={!invite?.name.trim() || (invite?.phone.replace(/\D/g, "").length ?? 0) < 10}
              onClick={() => {
                if (!invite) return;
                const digits = invite.phone.replace(/\D/g, "");
                add(
                  "settings",
                  { id: `a-${Date.now()}`, name: invite.name.trim(), phone: `${digits.slice(0, 4)} •••• ${digits.slice(-3)}`, role: invite.role, lastActive: new Date().toISOString() },
                  { action: "Added admin", target: invite.name.trim(), detail: ROLE_LABEL[invite.role], toast: `${invite.name.trim()} added as ${ROLE_LABEL[invite.role]}` },
                );
                setInvite(null);
              }}
            >
              Add
            </Btn>
          </>
        }
      >
        {invite && (
          <div className="space-y-4">
            <div>
              <label htmlFor="i-name" className="text-[13px] font-semibold text-ink">
                Name
              </label>
              <input id="i-name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} className={cn(inputCls, "mt-1.5")} />
            </div>
            <div>
              <label htmlFor="i-phone" className="text-[13px] font-semibold text-ink">
                Phone
              </label>
              <input id="i-phone" inputMode="tel" value={invite.phone} onChange={(e) => setInvite({ ...invite, phone: e.target.value })} placeholder="03xx xxxxxxx" className={cn(inputCls, "mt-1.5")} />
              <p className="mt-1 text-[12px] text-muted">They sign in with this number once phone login is live.</p>
            </div>
            <fieldset>
              <legend className="text-[13px] font-semibold text-ink">Role</legend>
              <div className="mt-2 space-y-2">
                {(["admin", "moderator", "support"] as AdminRole[]).map((r) => (
                  <label key={r} className={cn("flex cursor-pointer items-start gap-3 rounded-xl border p-3", invite.role === r ? "border-mountain bg-mint/60" : "border-line-strong")}>
                    <input type="radio" name="role" checked={invite.role === r} onChange={() => setInvite({ ...invite, role: r })} className="mt-1 accent-mountain" />
                    <span>
                      <span className="block text-[13.5px] font-semibold text-ink">{ROLE_LABEL[r]}</span>
                      <span className="block text-[12px] text-muted">{ROLE_NOTE[r]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.name ?? ""}?`}
        body="They lose admin access straight away. Their past actions stay in the activity log."
        confirmLabel="Remove"
        tone="danger"
        onConfirm={() => removing && patch("settings", removing.id, { _deleted: true }, { action: "Removed admin", target: removing.name, toast: `${removing.name} removed` })}
      />
      <ConfirmDialog
        open={resetting}
        onClose={() => setResetting(false)}
        title="Reset preview data?"
        body="All approvals, edits and messages you made in this preview (on this browser) are cleared."
        confirmLabel="Reset"
        tone="danger"
        onConfirm={reset}
      />
    </div>
  );
}
