"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** FormData → "/search?…", skipping empty fields so URLs stay short. */
export function formToHref(form: HTMLFormElement) {
  const qs = new URLSearchParams();
  for (const [k, v] of new FormData(form)) {
    const s = String(v).trim();
    if (s) qs.set(k, s);
  }
  const str = qs.toString();
  return str ? `/search?${str}` : "/search";
}

/**
 * Wraps the server-rendered filter fields.
 * - `auto` (desktop sidebar): radios/checkboxes apply instantly; price applies on "Go".
 * - otherwise (phone sheet): nothing happens until "Show results".
 */
export function FilterForm({
  auto = false,
  children,
  className,
  onDone,
  id,
}: {
  auto?: boolean;
  children: ReactNode;
  className?: string;
  onDone?: () => void;
  id?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const go = (form: HTMLFormElement) => {
    start(() => router.push(formToHref(form), { scroll: false }));
    onDone?.();
  };

  const onChange = (e: ChangeEvent<HTMLFormElement>) => {
    if (!auto) return;
    const t = e.target as unknown as HTMLInputElement;
    if (t.type === "radio" || t.type === "checkbox") go(e.currentTarget);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    go(e.currentTarget);
  };

  return (
    <form
      id={id}
      action="/search"
      onChange={onChange}
      onSubmit={onSubmit}
      aria-busy={pending}
      className={cn("transition-opacity", pending && "opacity-60", className)}
    >
      {children}
    </form>
  );
}
