"use client";

import type { ReactNode } from "react";
import { SelectMenu, type SelectOption } from "@/components/search/select-menu";
import { cn } from "@/lib/utils";

/** SelectMenu dressed as a form input (bordered, 48px), with an error state. */
export function FormSelect({
  id,
  name,
  label,
  options,
  value,
  onChange,
  placeholder,
  icon,
  invalid,
}: {
  id: string;
  name: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon?: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center rounded-xl border bg-white transition focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]",
        invalid ? "border-[#d92d20]" : "border-line-strong",
      )}
    >
      <SelectMenu
        key={value || "empty"}
        id={id}
        name={name}
        label={label}
        options={options}
        defaultValue={value}
        placeholder={placeholder}
        onChange={onChange}
        icon={icon}
        panelWidth={340}
        className="rounded-xl"
      />
    </div>
  );
}
