"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Btn, type BtnTone } from "./primitives";

/** Open overlays, top-most last: Escape only closes the top one. */
const stack: symbol[] = [];

function useOverlay(open: boolean, onClose: () => void) {
  const panel = useRef<HTMLDivElement>(null);
  // Keep the latest onClose without re-running the effect (that would steal focus while typing)
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const me = Symbol("overlay");
    stack.push(me);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack[stack.length - 1] === me) close.current();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      stack.splice(stack.indexOf(me), 1);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);
  return panel;
}

/** Right-hand detail sheet (full screen on phones). */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 560,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const panel = useOverlay(open, onClose);
  const id = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fade-in bg-[#0b1511]/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-cream shadow-[-24px_0_60px_-30px_rgb(0_0_0/0.4)] outline-none md:rounded-l-2xl"
      >
        <div className="flex items-start gap-3 border-b border-line bg-white px-5 py-4 md:rounded-tl-2xl">
          <div className="min-w-0 flex-1">
            <h2 id={id} className="text-[17px] font-semibold leading-snug text-ink">
              {title}
            </h2>
            {subtitle && <div className="mt-0.5 text-[13px] text-muted">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-white px-5 py-3.5 md:rounded-bl-2xl">{footer}</div>}
      </div>
    </div>
  );
}

/** Centered dialog. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 480,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const panel = useOverlay(open, onClose);
  const id = useId();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end p-0 sm:place-items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-[#0b1511]/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        style={{ maxWidth: width }}
        className="relative flex max-h-[90dvh] w-full animate-fade-in flex-col rounded-t-2xl bg-white shadow-float outline-none sm:rounded-2xl"
      >
        <div className="flex items-center gap-3 px-5 pb-2 pt-5">
          <h2 id={id} className="min-w-0 flex-1 text-[17px] font-semibold text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-stone hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-1">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * Ask for a reason before a negative action (reject, suspend, ban, remove).
 * The reason is saved in the activity log and sent to the user.
 */
export function ReasonDialog({
  open,
  onClose,
  onConfirm,
  title,
  intro,
  reasons,
  confirmLabel,
  tone = "danger",
  requireReason = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  intro?: ReactNode;
  reasons: string[];
  confirmLabel: string;
  tone?: BtnTone;
  requireReason?: boolean;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (open) {
      setPicked(null);
      setNote("");
    }
  }, [open]);
  const reason = [picked, note.trim()].filter(Boolean).join(" — ");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            tone={tone}
            disabled={requireReason && !reason}
            onClick={() => {
              onConfirm(reason);
              onClose();
            }}
          >
            {confirmLabel}
          </Btn>
        </>
      }
    >
      {intro && <div className="text-[13.5px] text-muted">{intro}</div>}
      <p className="mt-3 text-[13px] font-semibold text-ink">Reason</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {reasons.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setPicked(picked === r ? null : r)}
            aria-pressed={picked === r}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              picked === r ? "border-mountain bg-mint text-mountain" : "border-line-strong bg-white text-ink/85 hover:border-ink/40",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-[13px] font-semibold text-ink" htmlFor="reason-note">
        Note to the user <span className="font-normal text-muted">(optional)</span>
      </label>
      <textarea
        id="reason-note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Please upload clear photos of the actual item."
        className="mt-1.5 w-full resize-none rounded-xl border border-line-strong px-3.5 py-2.5 text-[14px] outline-none focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]"
      />
    </Modal>
  );
}

/** Simple yes / no. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  tone = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  tone?: BtnTone;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      width={420}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn
            tone={tone}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Btn>
        </>
      }
    >
      <div className="text-[14px] leading-relaxed text-muted">{body}</div>
    </Modal>
  );
}
