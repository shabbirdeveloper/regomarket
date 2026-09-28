import type { Metadata } from "next";
import { adminMode, requireAdmin } from "@/lib/admin/auth";
import { getAdminTeam } from "@/lib/admin/data";
import { PageHeader } from "@/components/admin/ui/primitives";
import { SettingsModule } from "@/components/admin/settings/settings-module";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const team = await getAdminTeam();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Site details, marketplace rules and who can use the admin." />
      <SettingsModule team={team} adminMode={adminMode()} />
    </div>
  );
}
