import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import type { OrderStatus } from "@/components/orders/shared";

/** The one next step for each status, as the shop sees it. */
export const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string; hint: string }>> = {
  placed: { to: "confirmed", label: "Confirm order", hint: "You have it and will send it" },
  confirmed: { to: "shipped", label: "Mark as shipped", hint: "Handed to the rider / cargo" },
  shipped: { to: "delivered", label: "Mark as delivered", hint: "The buyer has it" },
};

export const SHOP_STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "New",
  confirmed: "To ship",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CANCEL_REASONS = ["Out of stock", "Can't deliver to this area", "Buyer not answering the phone", "Payment not received", "Buyer asked to cancel"];

/** Calls update_order. Returns an error sentence, or null when it worked. */
export async function updateOrder(id: string, change: { status?: OrderStatus; paid?: boolean; reason?: string }) {
  const db = supabaseBrowser();
  if (!db) return "Not connected";
  const { error } = await db.rpc("update_order", {
    p_order: id,
    p_status: change.status ?? null,
    p_paid: change.paid ?? null,
    p_reason: change.reason ?? null,
  });
  return error ? friendlyError(error) : null;
}
