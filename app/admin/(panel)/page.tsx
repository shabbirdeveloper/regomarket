import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminListings, getAuditLog, getOverview } from "@/lib/admin/data";
import { OverviewView } from "@/components/admin/overview/overview-view";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  const [overview, listings, log] = await Promise.all([getOverview(), getAdminListings(), getAuditLog()]);
  const pending = listings.filter((l) => l.status === "pending").slice(0, 5);
  return <OverviewView data={overview} pending={pending} log={log} firstName={admin.name.split(" ")[0]} />;
}
