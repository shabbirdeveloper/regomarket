import type { Metadata } from "next";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { getNotifications } from "@/lib/data";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { NotificationsList } from "@/components/account/notifications-list";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const items = await getNotifications();
  return (
    <div className="min-h-[70vh] bg-cream">
      <div className="shell max-w-3xl pb-16 pt-4 md:pt-6">
        <Breadcrumb items={[{ label: "Notifications" }]} />
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink md:text-[30px]">Notifications</h1>
            <p className="mt-1 text-[14px] text-muted">Offers, replies, price drops and news from shops you follow.</p>
          </div>
          <Link href="/dashboard#settings" className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-white px-3.5 text-[13px] font-semibold text-ink hover:border-ink">
            <Settings2 className="size-4" aria-hidden /> Settings
          </Link>
        </div>
        <div className="mt-6">
          <NotificationsList initial={items} />
        </div>
      </div>
    </div>
  );
}
