"use client";

import { useEffect, useState } from "react";
import { Check, Landmark, Loader2, Pencil, Plus, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Method = "easypaisa" | "jazzcash" | "bank";
interface Account {
  method: Method;
  account_title: string;
  account_number: string;
  bank_name: string | null;
}

const METHODS: { key: Method; label: string; Icon: typeof Smartphone; numberHint: string }[] = [
  { key: "easypaisa", label: "Easypaisa", Icon: Smartphone, numberHint: "03xx xxxxxxx" },
  { key: "jazzcash", label: "JazzCash", Icon: Smartphone, numberHint: "03xx xxxxxxx" },
  { key: "bank", label: "Bank account", Icon: Landmark, numberHint: "IBAN or account number" },
];

const inputCls = "h-10 w-full rounded-lg border border-line-strong bg-white px-3 text-[14px] outline-none focus:border-mountain";

/**
 * Where buyers send money for wallet / bank orders. Only buyers who ordered
 * from this shop can see these (database rule), never the public.
 */
export function PaymentAccounts({ shopId }: { shopId: string }) {
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const db = supabaseBrowser();

  useEffect(() => {
    if (!db) return;
    db.from("shop_payment_accounts")
      .select("method,account_title,account_number,bank_name")
      .eq("shop_id", shopId)
      .then(({ data }) => setAccounts((data as Account[]) ?? []));
  }, [db, shopId]);

  const save = async () => {
    if (!db || !editing) return;
    if (editing.account_title.trim().length < 2) return setError("Enter the account holder's name.");
    if (editing.account_number.replace(/\s/g, "").length < 6) return setError("Enter the full account number.");
    setBusy(true);
    setError("");
    const row = {
      shop_id: shopId,
      method: editing.method,
      account_title: editing.account_title.trim(),
      account_number: editing.account_number.trim(),
      bank_name: editing.method === "bank" ? editing.bank_name?.trim() || null : null,
    };
    const { error: e } = await db.from("shop_payment_accounts").upsert(row, { onConflict: "shop_id,method" });
    setBusy(false);
    if (e) return setError(friendlyError(e));
    setAccounts((list) => [...(list ?? []).filter((a) => a.method !== row.method), row]);
    setEditing(null);
  };

  const remove = async (m: Method) => {
    if (!db) return;
    const { error: e } = await db.from("shop_payment_accounts").delete().eq("shop_id", shopId).eq("method", m);
    if (e) return setError(friendlyError(e));
    setAccounts((list) => (list ?? []).filter((a) => a.method !== m));
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="text-[15px] font-semibold text-ink">Where buyers pay you</h2>
      <p className="mt-0.5 text-[12.5px] text-muted">Shown only to buyers after they order from you. Cash on delivery always works.</p>

      {accounts === null ? (
        <div className="grid place-items-center py-8">
          <Loader2 className="size-5 animate-spin text-muted" aria-label="Loading" />
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {METHODS.map(({ key, label, Icon, numberHint }) => {
            const acc = accounts.find((a) => a.method === key);
            const open = editing?.method === key;
            return (
              <li key={key} className={cn("rounded-xl border", open ? "border-mountain" : "border-line")}>
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", acc ? "bg-mint text-mountain" : "bg-stone text-muted")}>
                    <Icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
                    <span className="block truncate text-[12.5px] text-muted">{acc ? `${acc.account_title} · ${acc.account_number}` : "Not added"}</span>
                  </span>
                  {!open &&
                    (acc ? (
                      <span className="flex gap-1">
                        <button type="button" onClick={() => setEditing({ ...acc })} aria-label={`Edit ${label}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
                          <Pencil className="size-4" />
                        </button>
                        <button type="button" onClick={() => remove(key)} aria-label={`Remove ${label}`} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-urgent-wash hover:text-urgent">
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditing({ method: key, account_title: "", account_number: "", bank_name: "" })}
                        className="inline-flex items-center gap-1 rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:border-ink"
                      >
                        <Plus className="size-3.5" aria-hidden /> Add
                      </button>
                    ))}
                </div>
                {open && editing && (
                  <div className="space-y-2.5 border-t border-line px-3.5 py-3">
                    <input aria-label="Account holder name" placeholder="Account holder name" value={editing.account_title} onChange={(e) => setEditing({ ...editing, account_title: e.target.value })} className={inputCls} />
                    {key === "bank" && (
                      <input aria-label="Bank name" placeholder="Bank name (e.g. HBL, Meezan)" value={editing.bank_name ?? ""} onChange={(e) => setEditing({ ...editing, bank_name: e.target.value })} className={inputCls} />
                    )}
                    <input
                      aria-label="Account number"
                      placeholder={numberHint}
                      inputMode={key === "bank" ? "text" : "numeric"}
                      value={editing.account_number}
                      onChange={(e) => setEditing({ ...editing, account_number: e.target.value })}
                      className={cn(inputCls, "font-mono")}
                    />
                    {error && <p className="text-[12.5px] font-medium text-urgent">{error}</p>}
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setError("");
                        }}
                        className="h-9 rounded-full px-3 text-[13px] font-semibold text-muted hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button type="button" onClick={save} disabled={busy} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-mountain px-4 text-[13px] font-semibold text-white disabled:opacity-60">
                        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Check className="size-4" aria-hidden />} Save
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 flex items-start gap-2 text-[12px] text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> Always check the money reached your account before you mark an order as paid.
      </p>
    </section>
  );
}
