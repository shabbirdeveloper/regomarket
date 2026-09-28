"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase/browser";

export interface MyShop {
  id: string;
  name: string;
  slug: string;
  district: string;
  status: string;
  accepts_orders: boolean;
}

/** The shop owned by the signed-in user (undefined = loading, null = none). */
export function useMyShop() {
  const { profile } = useAuth();
  const [shop, setShop] = useState<MyShop | null | undefined>(undefined);

  useEffect(() => {
    const db = supabaseBrowser();
    if (!db || !profile) return;
    db.from("shops")
      .select("id,name,slug,district,status,accepts_orders")
      .eq("seller_id", profile.sellerId)
      .maybeSingle<MyShop>()
      .then(({ data }) => setShop(data ?? null));
  }, [profile]);

  return shop;
}
