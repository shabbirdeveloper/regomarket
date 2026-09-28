"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { timeAgo } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { NotificationsList, type NotificationView } from "./notifications-list";

/** The signed-in user's real notifications (order updates, ad approvals…). */
export function LiveNotifications() {
  return (
    <RequireAuth title="Sign in to see your notifications">
      <Live />
    </RequireAuth>
  );
}

function Live() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationView[] | null>(null);
  const db = supabaseBrowser();

  useEffect(() => {
    if (!db || !user) return;
    db.from("notifications")
      .select("id,kind,title,body,href,read,created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) =>
        setItems(
          (data ?? []).map((n: { id: string; kind: NotificationView["kind"]; title: string; body: string; href: string; read: boolean; created_at: string }) => ({
            id: n.id,
            kind: n.kind,
            title: n.title,
            body: n.body,
            href: n.href,
            read: n.read,
            when: timeAgo(n.created_at),
          })),
        ),
      );
  }, [db, user]);

  if (!items) {
    return (
      <div className="grid place-items-center rounded-2xl border border-line bg-white py-16">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  return (
    <NotificationsList
      initial={items}
      onRead={(id) => db?.from("notifications").update({ read: true }).eq("id", id).then(() => undefined)}
      onReadAll={() => user && db?.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false).then(() => undefined)}
    />
  );
}
