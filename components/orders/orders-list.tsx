"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, Package, Store } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { ORDER_SELECT, STATUS_LABEL, STATUS_TONE, imgSrc, orderDate, rs, type OrderRow } from "./shared";

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export function OrdersList() {
  const { enabled } = useAuth();
  if (!enabled) {
    return (
      <div className="shell py-16 text-center text-[14.5px] text-muted">
        Orders appear here on the live site once you sign in.{" "}
        <Link href="/" className="font-semibold text-mountain">
          Go home
        </Link>
      </div>
    );
  }
  return (
    <RequireAuth title="Sign in to see your orders">
      <List />
    </RequireAuth>
  );
}

function List() {
  const { user } = useAuth();
  const [rows, setRows] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db || !user) return;
    db.from("orders")
      .select(ORDER_SELECT)
      .eq("buyer_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error: e }) => {
        if (e) setError(friendlyError(e));
        setRows((data as unknown as OrderRow[]) ?? []);
      });
  }, [user]);

  const list = (rows ?? []).filter((o) =>
    tab === "all" ? true : tab === "active" ? ["placed", "confirmed", "shipped"].includes(o.status) : o.status === tab,
  );

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        <div className="mx-auto max-w-4xl">
        <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">My orders</h1>

        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 text-[13.5px] font-semibold transition-colors",
                tab === t.key ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 rounded-xl bg-urgent-wash px-4 py-3 text-[13.5px] text-urgent">{error}</p>}

        {rows === null ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
          </div>
        ) : list.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-mint text-mountain">
              <Package className="size-6" aria-hidden />
            </span>
            <p className="mt-4 text-[16px] font-semibold text-ink">{rows.length ? "No orders in this tab" : "No orders yet"}</p>
            <p className="mt-1 text-[13.5px] text-muted">Items with the Delivery tag can be ordered from verified shops.</p>
            <Link href="/search?delivery=1" className="mt-5 inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {list.map((o) => {
              const first = o.order_items[0];
              const more = o.order_items.length - 1;
              const img = imgSrc(first?.image ?? null);
              return (
                <li key={o.id}>
                  <Link href={`/orders/${o.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-line-strong md:p-5">
                    <span className="block size-16 shrink-0 overflow-hidden rounded-xl bg-stone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img && <img src={img} alt="" className="size-full object-cover" loading="lazy" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", STATUS_TONE[o.status])}>{STATUS_LABEL[o.status]}</span>
                        {o.payment !== "cod" && o.payment_status === "unpaid" && o.status !== "cancelled" && (
                          <span className="rounded-full bg-urgent-wash px-2.5 py-0.5 text-[12px] font-semibold text-urgent">Payment needed</span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-[14.5px] font-semibold text-ink">
                        {first?.title}
                        {more > 0 ? ` + ${more} more` : ""}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Store className="size-3.5" aria-hidden /> {o.shops?.name ?? "Shop"}
                        </span>
                        <span>· {o.id}</span>
                        <span>· {orderDate(o.created_at)}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold tabular-nums text-ink">{rs(o.total)}</p>
                      <ChevronRight className="ml-auto mt-1 size-4 text-muted" aria-hidden />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
}
