"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BadgeCheck, Bell, CalendarDays, Heart, Loader2, LogOut, Mail, MapPin, Megaphone, MessageSquareText, Package, Pencil, Plus, Store, Tag, X } from "lucide-react";
import { useAuth, initialsOf } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { Field, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { usePersistentSet } from "@/hooks/use-persistent-set";
import { districtOptions } from "@/lib/options";
import { placeLabel } from "@/lib/format";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

interface MyAd {
  id: string;
  slug: string;
  title: string;
  price: number;
  status: string;
  images: { src: string }[];
  views: number;
  posted_at: string;
}

const STATUS: Record<string, [string, string]> = {
  pending: ["Being checked", "bg-gold-wash text-gold-ink"],
  active: ["Live", "bg-mint text-success"],
  rejected: ["Needs changes", "bg-urgent-wash text-urgent"],
  removed: ["Removed", "bg-urgent-wash text-urgent"],
  sold: ["Sold", "bg-stone text-muted"],
  expired: ["Expired", "bg-stone text-muted"],
};

const nf = new Intl.NumberFormat("en-US");

function thumb(src?: string) {
  if (!src) return null;
  return src.includes("images.unsplash.com") ? src.replace(/w=\d+/, "w=200") : src;
}

export function AccountView() {
  return (
    <RequireAuth title="Sign in to see your account">
      <Account />
    </RequireAuth>
  );
}

function Account() {
  const router = useRouter();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const saved = usePersistentSet("saved");
  const [ads, setAds] = useState<MyAd[] | null>(null);
  const [orders, setOrders] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const db = supabaseBrowser();

  const load = useCallback(async () => {
    if (!db || !profile) return;
    const [{ data: a }, { count }] = await Promise.all([
      db.from("listings").select("id,slug,title,price,status,images,views,posted_at").eq("seller_id", profile.sellerId).order("posted_at", { ascending: false }),
      db.from("orders").select("id", { count: "exact", head: true }).eq("buyer_user_id", user!.id),
    ]);
    setAds((a as MyAd[]) ?? []);
    setOrders(count ?? 0);
  }, [db, profile, user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!profile) return null;

  const idOk = profile.verifications.includes("identity") || profile.verifications.includes("business");
  const since = new Date(profile.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const live = ads?.filter((a) => a.status === "active").length ?? 0;
  const views = ads?.reduce((n, a) => n + (a.views ?? 0), 0) ?? 0;

  const markSold = async (ad: MyAd) => {
    if (!db) return;
    const { error } = await db.from("listings").update({ status: "sold" }).eq("id", ad.id);
    if (!error) setAds((list) => list?.map((x) => (x.id === ad.id ? { ...x, status: "sold" } : x)) ?? null);
  };

  const shortcuts = [
    ...(profile.type === "shop" || profile.shopSlug ? [{ href: "/shop-orders", Icon: Store, label: "Shop orders", note: "Confirm, ship and get paid" }] : []),
    { href: "/orders", Icon: Package, label: "My orders", note: orders === null ? "…" : orders ? `${orders} order${orders === 1 ? "" : "s"}` : "Nothing yet" },
    { href: "/cart", Icon: Tag, label: "Cart", note: "Items you picked" },
    { href: "/notifications", Icon: Bell, label: "Notifications", note: "Order and ad updates" },
    { href: "/messages", Icon: MessageSquareText, label: "Messages", note: "Chats with sellers" },
    { href: "/saved", Icon: Heart, label: "Saved", note: saved.count ? `${saved.count} saved` : "Ads & shops" },
    { href: "/wanted/new", Icon: Megaphone, label: "Post a request", note: "Tell sellers what you need" },
  ];

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        {/* Profile */}
        <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-mint text-[20px] font-bold text-mountain md:size-20 md:text-[24px]">{initialsOf(profile.name)}</span>
            <div className="min-w-0">
              <p className="text-[13px] text-muted">Assalam o Alaikum,</p>
              <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-[-0.02em] text-ink md:text-[26px]">
                {profile.name}
                {idOk && <BadgeCheck className="size-6 shrink-0 text-success" aria-label="Verified" />}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                {user?.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" aria-hidden /> {user.email}
                  </span>
                )}
                {profile.district && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {placeLabel({ district: profile.district, town: profile.town }, { withTown: true })}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="size-3.5" aria-hidden /> Member since {since}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/sell" className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-mountain px-5 text-[14px] font-semibold text-white hover:bg-mountain-hover md:flex-none">
              <Plus className="size-[18px]" strokeWidth={2.4} aria-hidden /> Post an ad
            </Link>
            <button type="button" onClick={() => setEditing(true)} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-line-strong bg-white px-5 text-[14px] font-semibold text-ink hover:border-ink md:flex-none">
              <Pencil className="size-4" aria-hidden /> Edit profile
            </button>
          </div>
        </section>

        {/* Numbers */}
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { v: ads ? String(live) : "…", l: "Live ads" },
            { v: ads ? nf.format(views) : "…", l: "Ad views" },
            { v: orders === null ? "…" : String(orders), l: "Orders" },
            { v: String(saved.count), l: "Saved" },
          ].map(({ v, l }) => (
            <div key={l} className="flex flex-col-reverse gap-1 rounded-2xl border border-line bg-white p-4">
              <dt className="text-[12.5px] text-muted">{l}</dt>
              <dd className="text-[24px] font-bold tracking-[-0.02em] text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          {/* My ads */}
          <section aria-labelledby="my-ads" className="rounded-2xl border border-line bg-white p-5 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 id="my-ads" className="text-[19px] font-semibold text-ink">
                My ads
              </h2>
              <Link href="/sell" className="text-[13.5px] font-semibold text-mountain hover:underline">
                + New ad
              </Link>
            </div>
            {ads === null ? (
              <div className="grid place-items-center py-12">
                <Loader2 className="size-5 animate-spin text-muted" aria-label="Loading" />
              </div>
            ) : ads.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[15px] font-semibold text-ink">No ads yet</p>
                <p className="mt-1 text-[13.5px] text-muted">Post your first ad in about 2 minutes. It&apos;s free.</p>
                <Link href="/sell" className="mt-4 inline-flex h-10 items-center rounded-full bg-mountain px-5 text-[13.5px] font-semibold text-white">
                  Post an ad
                </Link>
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {ads.map((a) => {
                  const [label, tone] = STATUS[a.status] ?? [a.status, "bg-stone text-muted"];
                  const img = thumb(a.images?.[0]?.src);
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <span className="block size-14 shrink-0 overflow-hidden rounded-lg bg-stone">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img && <img src={img} alt="" className="size-full object-cover" loading="lazy" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        {a.status === "active" ? (
                          <Link href={`/listing/${a.slug}`} className="block truncate text-[14.5px] font-semibold text-ink hover:underline">
                            {a.title}
                          </Link>
                        ) : (
                          <p className="truncate text-[14.5px] font-semibold text-ink">{a.title}</p>
                        )}
                        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
                          <span className="font-semibold text-ink">Rs {nf.format(a.price)}</span>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11.5px] font-semibold", tone)}>{label}</span>
                          <span>{a.views ?? 0} views</span>
                        </p>
                      </div>
                      {a.status === "active" && (
                        <button type="button" onClick={() => markSold(a)} className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 text-[12.5px] font-semibold text-ink hover:border-ink">
                          Mark sold
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            <nav aria-label="Account" className="overflow-hidden rounded-2xl border border-line bg-white">
              <ul className="divide-y divide-line">
                {shortcuts.map(({ href, Icon, label, note }) => (
                  <li key={href}>
                    <Link href={href} className="flex items-center gap-3 px-5 py-4 hover:bg-cream">
                      <span className="grid size-10 place-items-center rounded-full bg-mint text-mountain">
                        <Icon className="size-[18px]" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14.5px] font-semibold text-ink">{label}</span>
                        <span className="block text-[12.5px] text-muted">{note}</span>
                      </span>
                      <ArrowRight className="size-4 text-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {!profile.shopSlug && (
              <section className="rounded-2xl bg-forest p-6 text-white">
                <Store className="size-7 text-gold-soft" aria-hidden />
                <h2 className="mt-3 text-[18px] font-semibold">Sell a lot? Open a shop</h2>
                <p className="mt-1 text-[13.5px] leading-relaxed text-white/75">Your own shop page, followers, online orders and a verified badge.</p>
                <Link href="/create-shop" className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[13.5px] font-semibold text-ink hover:bg-gold-soft">
                  Create your shop <ArrowRight className="size-4" aria-hidden />
                </Link>
              </section>
            )}

            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white px-5 py-4 text-[14px] font-semibold text-[#b42318] hover:bg-urgent-wash"
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </div>

      {editing && <EditProfile onClose={() => setEditing(false)} onSaved={refreshProfile} />}
    </div>
  );
}

function EditProfile({ onClose, onSaved }: { onClose: () => void; onSaved: () => Promise<void> }) {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [district, setDistrict] = useState<string>(profile?.district ?? "");
  const [town, setTown] = useState(profile?.town ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    const db = supabaseBrowser();
    if (!db || !profile) return;
    if (name.trim().length < 2) return setError("Enter your name.");
    if (phone && !/^3\d{9}$/.test(phone)) return setError("Enter a mobile number like 355 1234567.");
    setBusy(true);
    setError("");
    try {
      const patch: Record<string, string | null> = { name: name.trim(), district: district || null, town: town.trim() || null };
      if (phone) patch.phone_masked = `0${phone.slice(0, 3)} •••• ${phone.slice(-3)}`;
      const { error: e1 } = await db.from("sellers").update(patch).eq("id", profile.sellerId);
      if (e1) throw e1;
      if (phone) {
        const { error: e2 } = await db.from("seller_contacts").upsert({ seller_id: profile.sellerId, phone: `+92${phone}` });
        if (e2) throw e2;
      }
      await onSaved();
      onClose();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end sm:place-items-center sm:p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-labelledby="ep-title" className="relative w-full max-w-md rounded-t-2xl bg-white p-6 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 id="ep-title" className="text-[18px] font-semibold text-ink">
            Edit profile
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full text-muted hover:bg-stone">
            <X className="size-5" />
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Name" htmlFor="ep-name">
            <TextInput id="ep-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="District" htmlFor="ep-district">
            <FormSelect id="ep-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose your district" />
          </Field>
          <Field label="Town / village" htmlFor="ep-town" optional>
            <TextInput id="ep-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Jutial" />
          </Field>
          <Field label="New mobile number" htmlFor="ep-phone" optional hint={profile?.phoneMasked ? `Now: ${profile.phoneMasked}` : undefined}>
            <TextInput id="ep-phone" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10))} placeholder="355 1234567" />
          </Field>
        </div>
        {error && <p className="mt-3 text-[13px] font-medium text-[#b42318]">{error}</p>}
        <button type="button" disabled={busy} onClick={save} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-70">
          {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Save
        </button>
      </div>
    </div>
  );
}
