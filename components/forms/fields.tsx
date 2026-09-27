import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Shared form building blocks for Sell / Wanted / Create shop. */

export const inputCls =
  "h-12 w-full rounded-xl border border-line-strong bg-white px-4 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)] aria-[invalid=true]:border-[#d92d20]";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-[14px] font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={htmlFor ? `${htmlFor}-err` : undefined} className="mt-1.5 text-[12.5px] font-medium text-[#b42318]">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12.5px] text-muted">{hint}</p>
      )}
    </div>
  );
}

export function TextInput({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-err` : undefined}
      className={cn(inputCls, className)}
      {...props}
    />
  );
}

export function TextArea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-err` : undefined}
      className={cn(inputCls, "h-auto resize-none py-3 leading-relaxed", className)}
      {...props}
    />
  );
}

/** Row of pill buttons acting as a radio group. */
export function Segmented<T extends string>({
  name,
  value,
  options,
  onChange,
  label,
}: {
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            name={name}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-10 rounded-full border px-4 text-[13.5px] font-medium transition-colors",
              on ? "border-mountain bg-mint text-mountain" : "border-line-strong bg-white text-ink hover:border-ink/50",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** A white section card with a numbered title. */
export function FormCard({ step, title, sub, children }: { step?: number; title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-7">
      <div className="flex items-start gap-3">
        {step !== undefined && (
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white">{step}</span>
        )}
        <div>
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[13px] text-muted">{sub}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
