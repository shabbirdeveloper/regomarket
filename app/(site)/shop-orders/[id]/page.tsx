import type { Metadata } from "next";
import { ShopOrderDetail } from "@/components/shop-orders/shop-order-detail";

export const metadata: Metadata = { title: "Shop order", robots: { index: false } };

export default async function ShopOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShopOrderDetail id={decodeURIComponent(id)} />;
}
