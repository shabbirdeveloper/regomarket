"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, Building2, CheckCircle2, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Field, TextInput } from "@/components/forms/fields";
import { cn } from "@/lib/utils";

type Step = "phone" | "code" | "profile" | "done";

/** "3551234567" → "355 1234567" */
const pretty = (d: string) => (d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d);

/**
 * Phone-number sign-in with a 6-digit SMS code — the way most people in GB
 * already log in to apps. New numbers get one extra step for name + account type.
 * Wired to Supabase Auth (phone OTP) later; for now any 6 digits continue.
 */
export function LoginFlow({ next = "/dashboard", mode = "login" }: { next?: string; mode?: "login" | "signup" }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"individual" | "business">("individual");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = (e?: FormEvent) => {
    e?.preventDefault();
    if (!/^3\d{9}$/.test(phone)) {
      setError("Enter a mobile number like 355 1234567.");
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep("code");
      setWait(45);
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => boxes.current[0]?.focus(), 50);
    }, 700);
  };

  const verify = (digits = code) => {
    if (digits.some((d) => !d)) {
      setError("Enter all 6 digits.");
      return;
    }
    setError("");
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(mode === "signup" ? "profile" : "done");
    }, 700);
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const nextCode = code.map((c, j) => (j === i ? d : c));
    setCode(nextCode);
    if (d && i < 5) boxes.current[i + 1]?.focus();
    if (d && i === 5 && nextCode.every(Boolean)) verify(nextCode);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) boxes.current[i - 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (d.length === 6) {
      e.preventDefault();
      const arr = d.split("");
      setCode(arr);
      verify(arr);
    }
  };

  useEffect(() => {
    if (step !== "done") return;
    const t = setTimeout(() => router.push(next), 1200);
    return () => clearTimeout(t);
  }, [step, next, router]);

  return (
    <div className="w-full max-w-[420px]">
      {step === "phone" && (
        <form onSubmit={sendCode} noValidate>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">We&apos;ll text a 6-digit code to your mobile. No password needed.</p>

          <div className="mt-7">
            <Field label="Mobile number" htmlFor="phone" error={error}>
              <div
                className={cn(
                  "flex h-12 items-center overflow-hidden rounded-xl border bg-white focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]",
                  error ? "border-[#d92d20]" : "border-line-strong",
                )}
              >
                <span className="flex h-full items-center gap-1.5 border-r border-line bg-cream px-3.5 text-[15px] font-semibold text-ink">
                  <span aria-hidden>🇵🇰</span> +92
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  autoFocus
                  value={pretty(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10))}
                  placeholder="355 1234567"
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "phone-err" : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[16px] tracking-wide text-ink outline-none placeholder:text-muted"
                />
              </div>
            </Field>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Send code
          </button>

          <p className="mt-5 text-center text-[13.5px] text-muted">
            {mode === "signup" ? "Already have an account? " : "New to REGOMARKET? "}
            <Link href={`${mode === "signup" ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`} className="font-semibold text-mountain hover:underline">
              {mode === "signup" ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-6 text-center text-[12px] leading-relaxed text-muted">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      )}

      {step === "code" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          noValidate
        >
          <button type="button" onClick={() => setStep("phone")} className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13.5px] font-medium text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Change number
          </button>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.02em] text-ink">Enter the code</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Sent by SMS to <span className="font-semibold text-ink">+92 {pretty(phone)}</span>
          </p>

          <fieldset className="mt-7">
            <legend className="sr-only">6-digit code</legend>
            <div className="flex justify-between gap-2">
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    boxes.current[i] = el;
                  }}
                  value={d}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKey(i, e)}
                  onPaste={onPaste}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${i + 1}`}
                  className={cn(
                    "size-12 rounded-xl border bg-white text-center text-[20px] font-semibold text-ink outline-none transition focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)] sm:size-14",
                    error ? "border-[#d92d20]" : d ? "border-ink/40" : "border-line-strong",
                  )}
                />
              ))}
            </div>
          </fieldset>
          {error && <p className="mt-2 text-[12.5px] font-medium text-[#b42318]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Verify
          </button>
          <p className="mt-4 text-center text-[13.5px] text-muted">
            {wait > 0 ? (
              <>Resend code in 0:{String(wait).padStart(2, "0")}</>
            ) : (
              <button type="button" onClick={() => sendCode()} className="font-semibold text-mountain hover:underline">
                Resend code
              </button>
            )}
          </p>
        </form>
      )}

      {step === "profile" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              setError("Enter your name.");
              return;
            }
            setError("");
            setStep("done");
          }}
          noValidate
        >
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Almost done</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">Your number is verified. Tell buyers and sellers who you are.</p>
          <div className="mt-7 space-y-5">
            <Field label="Your name" htmlFor="name" error={error}>
              <TextInput id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Hassan" invalid={Boolean(error)} />
            </Field>
            <div>
              <p className="text-[14px] font-semibold text-ink">I&apos;m here as</p>
              <div className="mt-2 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Account type">
                {[
                  { v: "individual" as const, Icon: UserRound, t: "A person", s: "Buy and sell my things" },
                  { v: "business" as const, Icon: Building2, t: "A business", s: "Shop, farm or trader" },
                ].map(({ v, Icon, t, s }) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={kind === v}
                    onClick={() => setKind(v)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      kind === v ? "border-mountain bg-mint ring-1 ring-mountain" : "border-line-strong hover:border-ink/40",
                    )}
                  >
                    <Icon className={cn("size-5", kind === v ? "text-mountain" : "text-muted")} aria-hidden />
                    <span className="mt-2 block text-[14px] font-semibold text-ink">{t}</span>
                    <span className="block text-[12px] text-muted">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover">
            Continue
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="text-center" role="status">
          <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
          <h1 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-ink">{name ? `Welcome, ${name.split(" ")[0]}!` : "You're signed in"}</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            {kind === "business" && name ? "Next: open your shop from your account." : "Taking you back…"}
          </p>
          <Loader2 className="mx-auto mt-5 size-5 animate-spin text-muted" aria-hidden />
        </div>
      )}

      {step !== "done" && (
        <p className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <ShieldCheck className="size-4 text-success" aria-hidden /> We never show your full number without your OK.
        </p>
      )}
    </div>
  );
}
