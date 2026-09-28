"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, MessageSquareText, ShoppingCart, UserRound } from "lucide-react";
import { initialsOf, useAuth } from "@/components/auth/auth-provider";
import { useCart } from "@/lib/cart";
import { previewUser } from "@/lib/site";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { headerCountCls, headerIconCls } from "./header-styles";

/** Wide screens: avatar + "Hi, Ali" · or a Sign in button */
export function AccountChip() {
  const { enabled, loading, user, profile } = useAuth();
  const cls = "mr-1 hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-cream min-[1680px]:flex";

  if (enabled && loading) return <span className="mr-1 hidden size-8 animate-pulse rounded-full bg-stone min-[1680px]:block" aria-hidden />;

  if (enabled && !user) {
    return (
      <Link href="/login" className="mr-1 hidden h-10 items-center gap-2 rounded-full border border-line-strong px-4 text-[13.5px] font-semibold text-ink hover:border-ink md:inline-flex">
        <UserRound className="size-4" aria-hidden /> Sign in
      </Link>
    );
  }

  const name = enabled ? (profile?.name && profile.name !== "New user" ? profile.name : (user?.email?.split("@")[0] ?? "there")) : previewUser.name;
  const initials = enabled ? initialsOf(name) : previewUser.initials;
  return (
    <Link href="/dashboard" className={cls}>
      <span className="grid size-8 place-items-center rounded-full bg-mint text-[12px] font-semibold text-mountain">{initials}</span>
      <span className="leading-tight">
        <span className="block text-[12px] text-muted">Hi, {name.split(" ")[0]}</span>
        <span className="block text-[13px] font-semibold text-ink">My ads & account</span>
      </span>
    </Link>
  );
}

/** Mid-size screens: person icon (or initials when signed in) */
export function AccountIcon({ className }: { className?: string }) {
  const { enabled, loading, user, profile } = useAuth();
  if (enabled && !loading && !user) return null; // the Sign in button shows instead
  const signedIn = enabled && user;
  return (
    <Link href="/dashboard" data-tip="My account" className={cn(headerIconCls, className)}>
      {signedIn ? (
        <span className="grid size-8 place-items-center rounded-full bg-mint text-[11.5px] font-semibold text-mountain">{initialsOf(profile?.name ?? user?.email ?? "")}</span>
      ) : (
        <UserRound className="size-[21px]" strokeWidth={1.8} aria-hidden />
      )}
      <span className="sr-only">My account</span>
    </Link>
  );
}

export function MessagesLink({ className }: { className?: string }) {
  const { enabled, user } = useAuth();
  const [n, setN] = useState(enabled ? 0 : previewUser.unreadMessages);

  // Unread chat messages sent to me (RLS limits the count to my chats)
  useEffect(() => {
    const db = supabaseBrowser();
    if (!db || !user) {
      setN(enabled ? 0 : previewUser.unreadMessages);
      return;
    }
    let alive = true;
    const load = () =>
      db
        .from("messages")
        .select("id", { count: "exact", head: true })
        .is("read_at", null)
        .neq("sender_user_id", user.id)
        .then(({ count }) => alive && setN(count ?? 0));
    load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [enabled, user]);
  return (
    <Link href="/messages" data-tip="Messages" className={cn(headerIconCls, className)}>
      <MessageSquareText className="size-[21px]" strokeWidth={1.8} aria-hidden />
      <span className="sr-only">Messages{n ? `, ${n} unread` : ""}</span>
      {n > 0 && (
        <span aria-hidden className={headerCountCls}>
          {n}
        </span>
      )}
    </Link>
  );
}

/** Bell with the real unread count for signed-in users */
export function NotificationsLink({ className }: { className?: string }) {
  const { enabled, user } = useAuth();
  const [n, setN] = useState(enabled ? 0 : previewUser.unreadNotifications);

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db || !user) {
      setN(enabled ? 0 : previewUser.unreadNotifications);
      return;
    }
    let alive = true;
    const load = () =>
      db
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("read", false)
        .then(({ count }) => alive && setN(count ?? 0));
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [enabled, user]);

  return (
    <Link href="/notifications" data-tip="Notifications" className={cn(headerIconCls, className)}>
      <Bell className="size-[21px]" strokeWidth={1.8} aria-hidden />
      <span className="sr-only">Notifications{n ? `, ${n} new` : ""}</span>
      {n > 0 && (
        <span aria-hidden className={headerCountCls}>
          {n > 9 ? "9+" : n}
        </span>
      )}
    </Link>
  );
}

export function CartLink({ className }: { className?: string }) {
  const { count } = useCart();
  return (
    <Link href="/cart" data-tip="Cart" className={cn(headerIconCls, className)}>
      <ShoppingCart className="size-[21px]" strokeWidth={1.8} aria-hidden />
      <span className="sr-only">Cart{count ? `, ${count} items` : ""}</span>
      {count > 0 && (
        <span aria-hidden className={cn(headerCountCls, "bg-mountain")}>
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
