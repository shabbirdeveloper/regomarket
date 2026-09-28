import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bell, CalendarDays, Eye, Heart, LogOut, MapPin, Megaphone, MessageSquareText, Plus, ShieldCheck, Store } from "lucide-react";
import { getAccount } from "@/lib/data";
import { placeLabel, formatNumber } from "@/lib/format";
import { MyAds, type MyAd } from "@/components/account/my-ads";
import { SettingsPanel } from "@/components/account/settings-panel";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function DashboardPage() {
  const { me, ads, unreadMessages, unreadNotifications } = await getAccount();
  const live = ads.filter((a) => a.meta.status === "active");
  const views = ads.reduce((n, a) => n + a.views, 0);
  const chats = ads.reduce((n, a) => n + a.meta.chats, 0);
  const saves = ads.reduce((n, a) => n + a.meta.saves, 0);
  const since = new Date(me.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const idOk = me.verifications.includes("identity");

  const shortcuts = [
    { href: "/messages", Icon: MessageSquareText, label: "Messages", note: unreadMessages ? `${unreadMessages} unread` : "No new messages" },
    { href: "/notifications", Icon: Bell, label: "Notifications", note: unreadNotifications ? `${unreadNotifications} new` : "All caught up" },
    { href: "/saved", Icon: Heart, label: "Saved", note: "Ads & shops" },
    { href: "/wanted/new", Icon: Megaphone, label: "Post a request", note: "Tell sellers what you need" },
  ];

  return (
    <div className="bg-cream">
      <div className="shell pb-16 pt-4 md:pt-6">
        {/* Profile */}
        <section className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-mint text-[20px] font-bold text-mountain md:size-20 md:text-[24px]">SH</span>
            <div className="min-w-0">
              <p className="text-[13px] text-muted">Assalam o Alaikum,</p>
              <h1 className="flex items-center gap-2 text-[22px] font-bold tracking-[-0.02em] text-ink md:text-[26px]">
                {me.name}
                {idOk && <BadgeCheck className="size-6 shrink-0 text-success" aria-label="Verified" />}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden /> {placeLabel(me.place, { withTown: true })}
                </span>
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
            <Link href="#settings" className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line-strong bg-white px-5 text-[14px] font-semibold text-ink hover:border-ink md:flex-none">
              Settings
            </Link>
          </div>
        </section>

        {/* Numbers */}
        <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { Icon: Store, v: String(live.length), l: "Live ads" },
            { Icon: Eye, v: formatNumber(views), l: "Views" },
            { Icon: MessageSquareText, v: String(chats), l: "Chats" },
            { Icon: Heart, v: String(saves), l: "Saves" },
          ].map(({ Icon, v, l }) => (
            <div key={l} className="flex flex-col-reverse gap-1 rounded-2xl border border-line bg-white p-4">
              <dt className="flex items-center gap-1.5 text-[12.5px] text-muted">
                <Icon className="size-4" aria-hidden /> {l}
              </dt>
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
            <div className="mt-3">
              <MyAds initial={ads as MyAd[]} />
            </div>
          </section>

          <div className="space-y-6">
            {/* Shortcuts */}
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

            {/* Upgrade to a shop */}
            <section className="rounded-2xl bg-forest p-6 text-white">
              <Store className="size-7 text-gold-soft" aria-hidden />
              <h2 className="mt-3 text-[18px] font-semibold">Sell a lot? Open a shop</h2>
              <p className="mt-1 text-[13.5px] leading-relaxed text-white/75">
                Your own shop page, followers, online orders and a verified badge.
              </p>
              <Link href="/create-shop" className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-[13.5px] font-semibold text-ink hover:bg-gold-soft">
                Create your shop <ArrowRight className="size-4" aria-hidden />
              </Link>
            </section>

            {/* Trust */}
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-[15px] font-semibold text-ink">Your checks</h2>
              <ul className="mt-3 space-y-2 text-[13.5px]">
                {[
                  ["Phone number", me.verifications.includes("phone")],
                  ["CNIC (ID)", idOk],
                ].map(([l, ok]) => (
                  <li key={l as string} className="flex items-center justify-between">
                    <span className="text-ink/80">{l}</span>
                    <span className={ok ? "inline-flex items-center gap-1 font-semibold text-success" : "text-muted"}>
                      {ok ? (
                        <>
                          <ShieldCheck className="size-4" aria-hidden /> Verified
                        </>
                      ) : (
                        "Not yet"
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Settings */}
            <section id="settings" className="scroll-mt-28 rounded-2xl border border-line bg-white p-5">
              <h2 className="text-[15px] font-semibold text-ink">Notify me about</h2>
              <SettingsPanel />
              <Link href="/" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#b42318]">
                <LogOut className="size-4" aria-hidden /> Sign out
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
