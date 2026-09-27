"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { InputHTMLAttributes } from "react";

/** The header's search box, pre-filled with the current words on /search. */
export function HeaderQueryInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const pathname = usePathname();
  const params = useSearchParams();
  const q = pathname === "/search" ? (params.get("q") ?? "") : "";
  return <input key={q} defaultValue={q} {...props} />;
}
