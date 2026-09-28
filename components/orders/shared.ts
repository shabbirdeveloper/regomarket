export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItemRow {
  id: number;
  listing_slug: string | null;
  title: string;
  image: string | null;
  unit: string | null;
  unit_price: number;
  qty: number;
  line_total: number;
}

export interface OrderRow {
  id: string;
  status: OrderStatus;
  payment: "cod" | "easypaisa" | "jazzcash" | "bank";
  payment_status: "unpaid" | "submitted" | "paid";
  payment_ref: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  ship_name: string;
  ship_phone: string;
  ship_district: string;
  ship_town: string | null;
  ship_address: string;
  note: string | null;
  cancel_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  shop_id: string;
  shops: { name: string; slug: string; district: string } | null;
  order_items: OrderItemRow[];
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Waiting for the shop",
  confirmed: "Confirmed",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  placed: "bg-gold-wash text-gold-ink",
  confirmed: "bg-[#eaf1fb] text-[#1d4e89]",
  shipped: "bg-[#eaf1fb] text-[#1d4e89]",
  delivered: "bg-mint text-success",
  cancelled: "bg-urgent-wash text-urgent",
};

export const PAY_LABEL: Record<OrderRow["payment"], string> = {
  cod: "Cash on delivery",
  easypaisa: "Easypaisa",
  jazzcash: "JazzCash",
  bank: "Bank transfer",
};

const nf = new Intl.NumberFormat("en-US");
export const rs = (n: number) => `Rs ${nf.format(n)}`;

export const orderDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const imgSrc = (src: string | null, w = 160) => (!src ? null : src.includes("images.unsplash.com") ? src.replace(/w=\d+/, `w=${w}`) : src);

export const ORDER_SELECT =
  "id,status,payment,payment_status,payment_ref,subtotal,delivery_fee,total,ship_name,ship_phone,ship_district,ship_town,ship_address,note,cancel_reason,cancelled_by,created_at,confirmed_at,shipped_at,delivered_at,cancelled_at,shop_id,shops(name,slug,district),order_items(id,listing_slug,title,image,unit,unit_price,qty,line_total)";
