"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ListingCardData } from "@/types";
import { useAuth } from "@/components/auth/auth-provider";
import { RequireAuth } from "@/components/auth/require-auth";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { Inbox, type InboxConversation, type InboxLive, type InboxMessage } from "./inbox";

type ListingRow = { id: string; slug: string; title: string; price: number; unit: string | null; images: { src: string; alt?: string }[] | null; seller_id: string };
type SellerRow = { id: string; name: string; shop_slug: string | null; verifications: string[]; user_id: string | null };
type ConvRow = { id: string; listing_id: string; buyer_user_id: string; seller_id: string; last_message_at: string };
type MsgRow = { id: string; conversation_id: string; sender_user_id: string; body: string; offer: number | null; read_at: string | null; created_at: string };

/** Just the listing fields the chat shows (title, photo, price, link). */
const asCard = (l: ListingRow | undefined): ListingCardData =>
  ({
    id: l?.id ?? "",
    slug: l?.slug ?? "",
    title: l?.title ?? "Ad no longer available",
    images: l?.images?.length ? [{ src: l.images[0].src, alt: "" }] : [],
    price: { amount: Number(l?.price ?? 0), unit: l?.unit ?? undefined },
  }) as unknown as ListingCardData;

const verified = (s?: SellerRow) => Boolean(s?.verifications?.includes("identity") || s?.verifications?.includes("business"));

export function LiveInbox({ c, listing, shop }: { c?: string; listing?: string; shop?: string }) {
  return (
    <RequireAuth title="Sign in to see your messages" body="Chat with buyers and sellers safely. We email you a 6-digit code, no password needed.">
      <Live c={c} listingSlug={listing} shopSlug={shop} />
    </RequireAuth>
  );
}

function Live({ c, listingSlug, shopSlug }: { c?: string; listingSlug?: string; shopSlug?: string }) {
  const { user } = useAuth();
  const [convos, setConvos] = useState<InboxConversation[] | null>(null);
  const [initialId, setInitialId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const db = supabaseBrowser();
  const me = user?.id ?? "";

  /** Build inbox conversations from rows */
  const build = useMemo(
    () => async (rows: ConvRow[]): Promise<InboxConversation[]> => {
      if (!db || !rows.length) return [];
      const ids = rows.map((r) => r.id);
      const [{ data: ls }, { data: ms }, { data: sellers }] = await Promise.all([
        db.from("listings").select("id,slug,title,price,unit,images,seller_id").in("id", [...new Set(rows.map((r) => r.listing_id))]),
        db.from("messages").select("id,conversation_id,sender_user_id,body,offer,read_at,created_at").in("conversation_id", ids).order("created_at").limit(2000),
        db.from("sellers").select("id,name,shop_slug,verifications,user_id").or(
          `id.in.(${[...new Set(rows.map((r) => r.seller_id))].join(",")}),user_id.in.(${[...new Set(rows.map((r) => r.buyer_user_id))].join(",")})`,
        ),
      ]);
      const L = new Map(((ls ?? []) as ListingRow[]).map((l) => [l.id, l]));
      const S = (sellers ?? []) as SellerRow[];
      return rows.map((r) => {
        const buying = r.buyer_user_id === me;
        const other = buying ? S.find((s) => s.id === r.seller_id) : S.find((s) => s.user_id === r.buyer_user_id);
        const msgs = ((ms ?? []) as MsgRow[]).filter((m) => m.conversation_id === r.id);
        return {
          id: r.id,
          with: { name: other?.name && other.name !== "New user" ? other.name : buying ? "Seller" : "Buyer", shopSlug: buying ? (other?.shop_slug ?? undefined) : undefined, verified: verified(other) },
          role: buying ? "buying" : "selling",
          unread: msgs.filter((m) => m.sender_user_id !== me && !m.read_at).length,
          listing: asCard(L.get(r.listing_id)),
          messages: msgs.map((m): InboxMessage => ({ id: m.id, from: m.sender_user_id === me ? "me" : "them", text: m.body, at: m.created_at, offer: m.offer ?? undefined, read: m.sender_user_id === me ? Boolean(m.read_at) : undefined })),
        } satisfies InboxConversation;
      });
    },
    [db, me],
  );

  // First load + "Chat" from an ad / "Message" from a shop
  useEffect(() => {
    if (!db || !me) return;
    let alive = true;
    (async () => {
      const { data: rows, error: e } = await db.from("conversations").select("id,listing_id,buyer_user_id,seller_id,last_message_at").order("last_message_at", { ascending: false }).limit(200);
      if (e) {
        setError(friendlyError(e));
        setConvos([]);
        return;
      }
      const list = await build((rows ?? []) as ConvRow[]);
      let open: string | null = c && list.some((x) => x.id === c) ? c : null;

      if (!open && (listingSlug || shopSlug)) {
        let l: ListingRow | null = null;
        if (listingSlug) {
          const { data } = await db.from("listings").select("id,slug,title,price,unit,images,seller_id").eq("slug", listingSlug).maybeSingle<ListingRow>();
          l = data;
        } else if (shopSlug) {
          const { data: sh } = await db.from("shops").select("seller_id").eq("slug", shopSlug).maybeSingle<{ seller_id: string }>();
          if (sh) {
            const { data } = await db.from("listings").select("id,slug,title,price,unit,images,seller_id").eq("seller_id", sh.seller_id).eq("status", "active").order("posted_at", { ascending: false }).limit(1).maybeSingle<ListingRow>();
            l = data;
          }
        }
        if (l) {
          const existing = list.find((x) => x.role === "buying" && x.listing.id === l!.id);
          if (existing) open = existing.id;
          else {
            const { data: s } = await db.from("sellers").select("id,name,shop_slug,verifications,user_id").eq("id", l.seller_id).maybeSingle<SellerRow>();
            const own = s?.user_id === me;
            const fresh: InboxConversation = {
              id: `new-${l.id}`,
              with: { name: s?.name ?? "Seller", shopSlug: s?.shop_slug ?? undefined, verified: verified(s ?? undefined) },
              role: "buying",
              unread: 0,
              listing: asCard(l),
              messages: [],
              notice: own ? "This is your own ad." : !s?.user_id ? "This seller isn't on REGOMARKET chat yet. Please call them from the ad." : undefined,
            };
            list.unshift(fresh);
            open = fresh.id;
          }
        }
      }
      if (!alive) return;
      setConvos(list);
      setInitialId(open);
    })();
    return () => {
      alive = false;
    };
  }, [db, me, c, listingSlug, shopSlug, build]);

  const live = useMemo<InboxLive | undefined>(() => {
    if (!db || !me) return undefined;
    return {
      async send(conv, text, offer) {
        const { data, error: e } = await db.rpc("send_message", {
          p_conversation: conv.id.startsWith("new-") ? null : conv.id,
          p_listing: conv.id.startsWith("new-") ? conv.listing.id : null,
          p_body: text,
          p_offer: offer ?? null,
        });
        if (e) throw new Error(friendlyError(e));
        const r = data as { conversation_id: string; id: string; created_at: string };
        return { conversationId: r.conversation_id, id: r.id, at: r.created_at };
      },
      markRead(id) {
        db.rpc("mark_conversation_read", { p_conversation: id }).then(() => undefined);
      },
      subscribe(on) {
        const toMsg = (m: MsgRow): InboxMessage => ({
          id: m.id,
          from: m.sender_user_id === me ? "me" : "them",
          text: m.body,
          at: m.created_at,
          offer: m.offer ?? undefined,
          read: m.sender_user_id === me ? Boolean(m.read_at) : Boolean(m.read_at),
        });
        const ch = db
          .channel(`inbox-${me}`)
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (p) => on((p.new as MsgRow).conversation_id, toMsg(p.new as MsgRow)))
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (p) => on((p.new as MsgRow).conversation_id, toMsg(p.new as MsgRow)))
          .subscribe();
        return () => {
          db.removeChannel(ch);
        };
      },
      async load(id) {
        const { data } = await db.from("conversations").select("id,listing_id,buyer_user_id,seller_id,last_message_at").eq("id", id).maybeSingle<ConvRow>();
        if (!data) return null;
        const [one] = await build([data]);
        return one ?? null;
      },
    };
  }, [db, me, build]);

  if (!convos) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-2xl border border-line bg-white">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  return (
    <>
      {error && <p className="mb-3 rounded-xl bg-urgent-wash px-4 py-3 text-[13.5px] text-urgent">{error}</p>}
      {convos.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <p className="text-[16px] font-semibold text-ink">No messages yet</p>
          <p className="mt-1 text-[13.5px] text-muted">Open any ad and tap “Chat” to ask the seller a question.</p>
        </div>
      ) : (
        <Inbox key={initialId ?? "none"} initial={convos} initialId={initialId} live={live} />
      )}
    </>
  );
}
