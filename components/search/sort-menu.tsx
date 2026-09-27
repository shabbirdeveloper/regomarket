"use client";

import { useRouter } from "next/navigation";
import { ArrowDownUp } from "lucide-react";
import { SelectMenu } from "./select-menu";
import { SEARCH_SORTS } from "@/lib/search-params";

/** Sort dropdown for results; `hrefs` maps each sort value to its URL. */
export function SortMenu({ value, hrefs }: { value: string; hrefs: Record<string, string> }) {
  const router = useRouter();
  return (
    <div className="flex h-10 w-[210px] items-center rounded-full border border-line-strong bg-white">
      <SelectMenu
        id="search-sort"
        name="sort-ui"
        label="Sort by"
        options={SEARCH_SORTS}
        defaultValue={value}
        panelWidth={220}
        icon={<ArrowDownUp className="size-4" aria-hidden />}
        onChange={(v) => router.push(hrefs[v], { scroll: false })}
        className="rounded-full px-3.5 [&>span:nth-child(2)]:text-[13.5px]"
      />
    </div>
  );
}
