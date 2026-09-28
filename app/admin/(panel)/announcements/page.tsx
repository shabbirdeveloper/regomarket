import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminBroadcasts } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { AnnouncementsModule } from "@/components/admin/announcements/announcements-module";

export const metadata: Metadata = { title: "Announcements" };

/** Rough audience sizes for the reach estimate (from the users table once live). */
const REACH = { everyone: 3240, sellers: 1180, shops: 41, buyers: 2060 };

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const history = await getAdminBroadcasts();
  return (
    <div className="space-y-6">
      <PageHeader title="Announcements" description="Tell users about news, safety tips and offers. Keep it short and useful — too many messages and people turn them off." />
      <AnnouncementsModule history={history} reach={REACH} />
    </div>
  );
}
