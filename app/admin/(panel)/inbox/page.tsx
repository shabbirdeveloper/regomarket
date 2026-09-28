import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminInbox } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { InboxModule } from "@/components/admin/inbox/inbox-module";

export const metadata: Metadata = { title: "Inbox" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminInboxPage({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const sp = await searchParams;
  const rows = await getAdminInbox();
  return (
    <div className="space-y-6">
      <PageHeader title="Inbox" description="Messages sent from the Contact page." />
      <InboxModule initial={rows} query={{ q: one(sp.q), tab: one(sp.tab) }} />
    </div>
  );
}
