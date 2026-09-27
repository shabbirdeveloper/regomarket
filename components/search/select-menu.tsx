"use client";

import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  /** Right-aligned secondary text, e.g. an ad count */
  hint?: string;
  /** Small square photo shown before the label */
  thumb?: string;
  /** Options with the same group are listed under a small heading */
  group?: string;
}

/**
 * A styled replacement for the native <select> in the search bar.
 * - Submits through a hidden input, so the search form still works as a plain GET.
 * - The list renders in a portal with fixed positioning, so it is never clipped
 *   by the hero's overflow and always sits right under its trigger.
 * - Keyboard: ↑ ↓ Home End to move, Enter to pick, Esc to close, letters to jump.
 */
export function SelectMenu({
  id,
  name,
  label,
  options,
  defaultValue = "",
  icon,
  panelWidth = 320,
  className,
  onChange,
  placeholder,
}: {
  id: string;
  name: string;
  /** Accessible name, e.g. "Category" */
  label: string;
  options: SelectOption[];
  defaultValue?: string;
  /** Leading icon in the trigger (and fallback thumb) */
  icon?: ReactNode;
  panelWidth?: number;
  className?: string;
  /** Optional: react to a pick (for client-side filters) */
  onChange?: (value: string) => void;
  /** Shown (muted) until something is picked; without it the first option is the default */
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? (placeholder ? undefined : options[0]);

  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const width = Math.max(r.width, panelWidth);
    const left = Math.min(r.left, window.innerWidth - width - 12);
    const top = r.bottom + 10;
    setPos({ top, left: Math.max(12, left), width, maxHeight: Math.max(220, window.innerHeight - top - 16) });
  }, [panelWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, place]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Focus the list and keep the active row in view
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const openMenu = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const choose = (i: number) => {
    setValue(options[i].value);
    onChange?.(options[i].value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      openMenu();
    }
  };

  const onListKey = (e: KeyboardEvent) => {
    const last = options.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") choose(active);
    else if (e.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "Tab") setOpen(false);
    else if (e.key.length === 1 && /\S/.test(e.key)) {
      const k = e.key.toLowerCase();
      const next = options.findIndex((o, i) => i > active && o.label.toLowerCase().startsWith(k));
      const wrap = options.findIndex((o) => o.label.toLowerCase().startsWith(k));
      const i = next !== -1 ? next : wrap;
      if (i !== -1) setActive(i);
      return;
    } else return;
    e.preventDefault();
  };

  let lastGroup: string | undefined;

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-label={`${label}: ${selected?.label ?? placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
        className={cn(
          "flex h-full w-full min-w-0 items-center gap-2.5 rounded-lg px-4 text-left outline-none transition-colors hover:bg-cream focus-visible:bg-cream",
          open && "bg-cream",
          className,
        )}
      >
        {icon && <span className="shrink-0 text-muted">{icon}</span>}
        <span className={cn("min-w-0 flex-1 truncate text-[15px] font-medium", selected ? "text-ink" : "font-normal text-muted")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>

      {mounted &&
        open &&
        pos &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${listId}-${active}`}
            onKeyDown={onListKey}
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: Math.min(440, pos.maxHeight) }}
            className="on-light fixed z-[80] overflow-y-auto rounded-lg border border-line bg-white py-1.5 shadow-[0_18px_44px_-14px_rgb(23_33_27/0.35)] outline-none animate-fade-in"
          >
            {options.map((o, i) => {
              const header = o.group && o.group !== lastGroup ? o.group : null;
              lastGroup = o.group;
              const isSel = o.value === value;
              return (
                <li key={o.value || "all"} role="presentation">
                  {header && (
                    <p className="px-3.5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{header}</p>
                  )}
                  <div
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={isSel}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(i)}
                    className={cn(
                      "mx-1.5 flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5",
                      i === active && "bg-cream",
                    )}
                  >
                    {o.thumb ? (
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-stone">
                        <Image src={o.thumb} alt="" fill sizes="36px" className="object-cover" />
                      </span>
                    ) : icon ? (
                      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-mint text-mountain">{icon}</span>
                    ) : null}
                    <span className={cn("min-w-0 flex-1 truncate text-[14px]", isSel ? "font-semibold text-mountain" : "text-ink")}>
                      {o.label}
                    </span>
                    {o.hint && <span className="tabular shrink-0 text-[12px] text-muted">{o.hint}</span>}
                    <Check className={cn("size-4 shrink-0 text-mountain", !isSel && "invisible")} strokeWidth={2.4} aria-hidden />
                  </div>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
