import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAuditLog } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { ActivityModule } from "@/components/admin/activity/activity-module";

export const metadata: Metadata = { title: "Activity log" };

export default async function AdminActivityPage() {
  await requireAdmin();
  const rows = await getAuditLog();
  return (
    <div className="space-y-6">
      <PageHeader title="Activity log" description="Every admin action: who did what, and when. It can’t be edited." />
      <ActivityModule initial={rows} />
    </div>
  );
}
