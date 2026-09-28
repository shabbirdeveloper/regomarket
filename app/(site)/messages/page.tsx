import type { Metadata } from "next";
import { getAllListingCards, getConversations, getShopBySlug } from "@/lib/data";
import { sellerById } from "@/data/sellers";
import { Inbox, type InboxConversation } from "@/components/messages/inbox";
import { LiveInbox } from "@/components/messages/live-inbox";
import { SUPABASE_ENABLED } from "@/lib/data/supabase";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

type SP = { c?: string; listing?: string; shop?: string };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  if (SUPABASE_ENABLED) {
    return (
      <div className="bg-cream">
        <div className="shell pb-6 pt-4 md:pb-10 md:pt-6">
          <h1 className="mb-4 text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">Messages</h1>
          <LiveInbox c={sp.c} listing={sp.listing} shop={sp.shop} />
        </div>
      </div>
    );
  }
  const convos: InboxConversation[] = await getConversations();
  let initialId: string | null = sp.c && convos.some((c) => c.id === sp.c) ? sp.c : null;

  // Arriving from an ad ("Chat" / "Ask a question") or a shop ("Message")
  if (!initialId && (sp.listing || sp.shop)) {
    const existing = convos.find((c) => (sp.listing ? c.listing.slug === sp.listing : c.with.shopSlug === sp.shop));
    if (existing) {
      initialId = existing.id;
    } else {
      let listing = sp.listing ? (await getAllListingCards()).find((l) => l.slug === sp.listing) : undefined;
      if (!listing && sp.shop) listing = (await getShopBySlug(sp.shop))?.products[0];
      if (listing && listing.seller.id !== "u-shabbir") {
        const seller = sellerById[listing.seller.id];
        const fresh: InboxConversation = {
          id: `new-${listing.id}`,
          with: {
            name: seller.name,
            shopSlug: seller.shopSlug,
            verified: seller.verifications.includes("identity") || seller.verifications.includes("business"),
          },
          role: "buying",
          unread: 0,
          listing,
          messages: [],
        };
        convos.unshift(fresh);
        initialId = fresh.id;
      }
    }
  }

  return (
    <div className="bg-cream">
      <div className="shell pb-6 pt-4 md:pb-10 md:pt-6">
        <h1 className="mb-4 text-[24px] font-bold tracking-[-0.02em] text-ink md:text-[28px]">Messages</h1>
        <Inbox key={initialId ?? "none"} initial={convos} initialId={initialId} />
      </div>
    </div>
  );
}
