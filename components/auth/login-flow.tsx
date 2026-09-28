"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { ArrowLeft, Building2, CheckCircle2, Loader2, Mail, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { Field, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { districtOptions } from "@/lib/options";
import { friendlyError, supabaseBrowser } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth-provider";

type Step = "email" | "code" | "profile" | "done";
const LEN = 6;
const EMPTY = Array.from({ length: LEN }, () => "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Our own limits (Supabase has its own on top): 5 codes per hour, 5 wrong tries per code. */
const MAX_SENDS_PER_HOUR = 5;
const MAX_WRONG = 5;
const SENDS_KEY = "rego:otp-sends";

function recentSends(): number[] {
  try {
    const list = JSON.parse(localStorage.getItem(SENDS_KEY) ?? "[]") as number[];
    return list.filter((t) => Date.now() - t < 3_600_000);
  } catch {
    return [];
  }
}
function recordSend() {
  try {
    localStorage.setItem(SENDS_KEY, JSON.stringify([...recentSends(), Date.now()]));
  } catch {
    /* storage blocked */
  }
}

/** "3551234567" → "355 1234567" */
const pretty = (d: string) => (d.length > 3 ? `${d.slice(0, 3)} ${d.slice(3)}` : d);

/**
 * Sign in or create an account with a 6-digit code sent by email (no password).
 * New accounts get one extra step: name, account type, district and mobile.
 * Phone (SMS) codes can be added later with an SMS provider — same flow.
 */
export function LoginFlow({ next = "/dashboard", mode = "login" }: { next?: string; mode?: "login" | "signup" }) {
  const router = useRouter();
  const auth = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(EMPTY);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"individual" | "business">("individual");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);
  const [wrong, setWrong] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const db = supabaseBrowser();
  const preview = !auth.enabled;

  // Already signed in → finish the profile or go straight on
  useEffect(() => {
    if (auth.loading || !auth.user || step === "done") return;
    if (auth.needsProfile) setStep("profile");
    else if (auth.profile && step !== "profile") router.replace(next);
  }, [auth.loading, auth.user, auth.needsProfile, auth.profile, step, next, router]);

  // Came back from an expired / used email link → say so
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const q = new URLSearchParams(window.location.search);
    const msg = h.get("error_description") ?? q.get("error_description");
    if (msg) {
      setError(/expired|invalid/i.test(msg) ? "That sign-in link has expired or was already used. Ask for a new code." : msg.replace(/\+/g, " "));
      window.history.replaceState(null, "", window.location.pathname + (q.get("next") ? `?next=${encodeURIComponent(q.get("next")!)}` : ""));
    }
  }, []);

  // Resend countdown
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendCode = async (e?: FormEvent) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL.test(clean)) {
      setError("Enter your email, like ali@gmail.com.");
      return;
    }
    const sent = recentSends();
    if (sent.length >= MAX_SENDS_PER_HOUR) {
      const mins = Math.max(1, Math.ceil((sent[0] + 3_600_000 - Date.now()) / 60_000));
      setError(`You asked for ${MAX_SENDS_PER_HOUR} codes in the last hour. Please try again in ${mins} min.`);
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (db) {
        const { error: err } = await db.auth.signInWithOtp({
          email: clean,
          // If someone taps the link in the email instead of typing the code, bring them back here
          options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/login?next=${encodeURIComponent(next)}` },
        });
        if (err) throw err;
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
      recordSend();
      setEmail(clean);
      setStep("code");
      setWrong(0);
      setWait(60);
      setCode(EMPTY);
      setTimeout(() => boxes.current[0]?.focus(), 50);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (digits = code) => {
    if (digits.some((d) => !d)) {
      setError(`Enter all ${LEN} digits.`);
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (db) {
        const { data, error: err } = await db.auth.verifyOtp({ email, token: digits.join(""), type: "email" });
        if (err) throw err;
        const uid = data.user?.id;
        const { data: row } = await db.from("sellers").select("name").eq("user_id", uid ?? "").maybeSingle<{ name: string }>();
        await auth.refreshProfile();
        setStep(!row || !row.name || row.name === "New user" ? "profile" : "done");
      } else {
        await new Promise((r) => setTimeout(r, 600));
        setStep(mode === "signup" ? "profile" : "done");
      }
    } catch (err) {
      const tries = wrong + 1;
      setWrong(tries);
      setCode(EMPTY);
      if (tries >= MAX_WRONG) {
        // Too many wrong codes: this code is finished, ask for a new one
        setStep("email");
        setError(`${MAX_WRONG} wrong codes. For your safety, ask for a new code.`);
        return;
      }
      setError(`${friendlyError(err)} (${MAX_WRONG - tries} ${MAX_WRONG - tries === 1 ? "try" : "tries"} left)`);
      setTimeout(() => boxes.current[0]?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!district) {
      setError("Choose your district.");
      return;
    }
    if (phone && !/^3\d{9}$/.test(phone)) {
      setError("Enter a mobile number like 355 1234567, or leave it empty.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (db && auth.user) {
        const masked = phone ? `0${phone.slice(0, 3)} •••• ${phone.slice(-3)}` : "";
        const { data: me, error: err } = await db
          .from("sellers")
          .update({ name: name.trim(), district, phone_masked: masked })
          .eq("user_id", auth.user.id)
          .select("id")
          .single<{ id: string }>();
        if (err) throw err;
        if (phone) {
          const { error: e2 } = await db.from("seller_contacts").upsert({ seller_id: me.id, phone: `+92${phone}` });
          if (e2) throw e2;
        }
        await auth.refreshProfile();
      }
      setStep("done");
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const nextCode = code.map((c, j) => (j === i ? d : c));
    setCode(nextCode);
    if (d && i < LEN - 1) boxes.current[i + 1]?.focus();
    if (d && i === LEN - 1 && nextCode.every(Boolean)) verify(nextCode);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) boxes.current[i - 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const d = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (d.length === LEN) {
      e.preventDefault();
      const arr = d.split("");
      setCode(arr);
      verify(arr);
    }
  };

  useEffect(() => {
    if (step !== "done") return;
    const dest = kind === "business" && name ? "/create-shop" : next;
    const t = setTimeout(() => router.replace(dest), 1100);
    return () => clearTimeout(t);
  }, [step, next, router, kind, name]);

  if (auth.loading) {
    return (
      <div className="grid w-full max-w-[420px] place-items-center py-24">
        <Loader2 className="size-6 animate-spin text-muted" aria-label="Loading" />
      </div>
    );
  }

  const primaryBtn =
    "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover disabled:opacity-70";

  return (
    <div className="w-full max-w-[420px]">
      {preview && step !== "done" && (
        <p className="mb-5 rounded-xl bg-gold-wash px-4 py-2.5 text-[12.5px] text-gold-ink">Preview mode: no email is sent, any 6 digits work.</p>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} noValidate>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">{mode === "signup" ? "Create your account" : "Sign in"}</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">We&apos;ll email you a 6-digit code. No password to remember.</p>

          <div className="mt-7">
            <Field label="Email" htmlFor="email" error={error}>
              <div
                className={cn(
                  "flex h-12 items-center overflow-hidden rounded-xl border bg-white focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]",
                  error ? "border-[#d92d20]" : "border-line-strong",
                )}
              >
                <Mail className="ml-4 size-[18px] shrink-0 text-muted" aria-hidden />
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? "email-err" : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] text-ink outline-none placeholder:text-muted"
                />
              </div>
            </Field>
          </div>

          <button type="submit" disabled={busy} className={cn(primaryBtn, "mt-5")}>
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
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
            }}
            className="-ml-2 inline-flex h-9 items-center gap-1 rounded-full px-2 text-[13.5px] font-medium text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden /> Change email
          </button>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.02em] text-ink">Check your email</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            We sent a {LEN}-digit code to <span className="font-semibold text-ink">{email}</span>. Look in Spam if you don&apos;t see it.
          </p>

          <fieldset className="mt-7">
            <legend className="sr-only">{LEN}-digit code</legend>
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
                  disabled={busy}
                  className={cn(
                    "size-12 rounded-xl border bg-white text-center text-[20px] font-semibold text-ink outline-none transition focus:border-mountain focus:shadow-[0_0_0_4px_rgb(6_78_59/0.1)] disabled:opacity-60 sm:size-14",
                    error ? "border-[#d92d20]" : d ? "border-ink/40" : "border-line-strong",
                  )}
                />
              ))}
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="mt-2 text-[12.5px] font-medium text-[#b42318]">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className={cn(primaryBtn, "mt-6")}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Verify
          </button>
          <p className="mt-4 text-center text-[13.5px] text-muted">
            {wait > 0 ? (
              <>Send a new code in 0:{String(wait).padStart(2, "0")}</>
            ) : (
              <button type="button" onClick={() => sendCode()} className="font-semibold text-mountain hover:underline">
                Send a new code
              </button>
            )}
          </p>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={saveProfile} noValidate>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Almost done</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">Tell buyers and sellers who you are.</p>
          <div className="mt-7 space-y-5">
            <Field label="Your name" htmlFor="name">
              <TextInput id="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Hassan" autoComplete="name" />
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
            <Field label="District" htmlFor="district">
              <FormSelect
                id="district"
                name="district"
                label="District"
                options={districtOptions}
                value={district}
                onChange={setDistrict}
                placeholder="Choose your district"
                icon={<MapPin className="size-4" aria-hidden />}
              />
            </Field>
            <Field label="Mobile number" htmlFor="phone" optional hint="For delivery and WhatsApp. Shown to others only when you allow it.">
              <div className="flex h-12 items-center overflow-hidden rounded-xl border border-line-strong bg-white focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]">
                <span className="flex h-full items-center border-r border-line bg-cream px-3.5 text-[15px] font-semibold text-ink">+92</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={pretty(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10))}
                  placeholder="355 1234567"
                  className="h-full min-w-0 flex-1 bg-transparent px-3.5 text-[16px] tracking-wide text-ink outline-none placeholder:text-muted"
                />
              </div>
            </Field>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-[13px] font-medium text-[#b42318]">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className={cn(primaryBtn, "mt-6")}>
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Continue
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="text-center" role="status">
          <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
          <h1 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-ink">
            {name ? `Welcome, ${name.trim().split(" ")[0]}!` : auth.profile?.name ? `Welcome back, ${auth.profile.name.split(" ")[0]}!` : "You're signed in"}
          </h1>
          <p className="mt-1.5 text-[14.5px] text-muted">{kind === "business" && name ? "Next: set up your shop." : "Taking you back…"}</p>
          <Loader2 className="mx-auto mt-5 size-5 animate-spin text-muted" aria-hidden />
        </div>
      )}

      {step !== "done" && (
        <p className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <ShieldCheck className="size-4 text-success" aria-hidden /> We never share your email or number without your OK.
        </p>
      )}
    </div>
  );
}
