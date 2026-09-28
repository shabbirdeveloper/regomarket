import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { getQueues } from "@/lib/admin/data";
import { AdminStoreProvider } from "@/components/admin/store";
import { AdminShell } from "@/components/admin/shell/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const queues = await getQueues();
  return (
    <AdminStoreProvider admin={admin} queues={queues}>
      <AdminShell>{children}</AdminShell>
    </AdminStoreProvider>
  );
}
