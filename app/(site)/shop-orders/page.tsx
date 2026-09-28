import type { Metadata } from "next";
import { ShopOrdersView } from "@/components/shop-orders/shop-orders-view";

export const metadata: Metadata = { title: "Shop orders", robots: { index: false } };

export default function ShopOrdersPage() {
  return <ShopOrdersView />;
}
