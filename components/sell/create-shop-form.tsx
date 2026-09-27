"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { BadgeCheck, Camera, CheckCircle2, FileCheck2, ImagePlus, LayoutGrid, MapPin, ShieldCheck, Store, Truck } from "lucide-react";
import { bazaars } from "@/data/bazaars";
import { categoryOptions, districtOptions } from "@/lib/options";
import { Field, FormCard, Segmented, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { cn } from "@/lib/utils";

type Errors = Partial<Record<"name" | "category" | "district" | "phone", string>>;
type Trade = "retail" | "wholesale" | "both";

const monogram = (n: string) =>
  n
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "RM";

function Toggle({ checked, onChange, label, hint, Icon }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint: string; Icon: typeof Truck }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn("flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors", checked ? "border-mountain bg-mint" : "border-line-strong hover:border-ink/40")}
    >
      <Icon className={cn("size-5 shrink-0", checked ? "text-mountain" : "text-muted")} aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-ink">{label}</span>
        <span className="block text-[12.5px] text-muted">{hint}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-mountain" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

/** Open a shop on REGOMARKET. Saves locally until Supabase + document review are live. */
export function CreateShopForm({ ownerName, phone }: { ownerName: string; phone: string }) {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [bazaar, setBazaar] = useState("");
  const [trade, setTrade] = useState<Trade>("retail");
  const [delivery, setDelivery] = useState(true);
  const [orders, setOrders] = useState(false);
  const [open, setOpen] = useState("09:00");
  const [close, setClose] = useState("20:00");
  const [days, setDays] = useState("Mon – Sat");
  const [about, setAbout] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const pick = (set: (u: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith("image/")) set(URL.createObjectURL(f));
    e.target.value = "";
  };

  const bazaarOptions = [{ value: "", label: "Not in a bazaar" }, ...bazaars.map((b) => ({ value: b.slug, label: b.name, hint: b.town }))];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (name.trim().length < 3) next.name = "Enter your shop's name.";
    if (!category) next.category = "Choose what your shop mainly sells.";
    if (!district) next.district = "Choose your district.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`cs-${first}`)?.focus();
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
        <h2 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-ink">{name} is almost ready</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          Our team will call you on {phone} within 1 working day to verify the shop. Meanwhile you can start adding products.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/sell" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
            Add first product
          </Link>
          <Link href="/dashboard" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink">
            Go to my account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="space-y-5">
        <FormCard step={1} title="Your shop">
          <Field label="Shop name" htmlFor="cs-name" error={errors.name}>
            <TextInput id="cs-name" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hunza Dry Fruits House" invalid={Boolean(errors.name)} />
          </Field>
          <Field label="One line about it" htmlFor="cs-tag" optional hint={`${tagline.length}/80`}>
            <TextInput id="cs-tag" value={tagline} maxLength={80} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Apricots and walnuts from our own orchards" />
          </Field>
          <Field label="Main category" htmlFor="cs-category" error={errors.category}>
            <FormSelect id="cs-category" name="category" label="Main category" options={categoryOptions} value={category} onChange={setCategory} placeholder="Choose a category" icon={<LayoutGrid className="size-4" aria-hidden />} invalid={Boolean(errors.category)} />
          </Field>
          <Field label="You sell">
            <Segmented
              name="trade"
              label="Trade type"
              value={trade}
              onChange={setTrade}
              options={[
                { value: "retail", label: "Retail" },
                { value: "wholesale", label: "Wholesale" },
                { value: "both", label: "Both" },
              ]}
            />
          </Field>
        </FormCard>

        <FormCard step={2} title="Logo and cover photo" sub="Your storefront. You can change these any time.">
          <div className="flex flex-wrap items-start gap-4">
            <label className="flex size-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-line-strong text-muted hover:bg-cream">
              <input type="file" accept="image/*" className="sr-only" onChange={pick(setLogo)} />
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Shop logo" className="size-full object-cover" />
              ) : (
                <>
                  <Camera className="size-6" aria-hidden />
                  <span className="text-[11.5px] font-semibold">Logo</span>
                </>
              )}
            </label>
            <label className="flex h-24 min-w-[220px] flex-1 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border-2 border-dashed border-line-strong text-muted hover:bg-cream">
              <input type="file" accept="image/*" className="sr-only" onChange={pick(setCover)} />
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cover} alt="Shop cover" className="size-full object-cover" />
              ) : (
                <>
                  <ImagePlus className="size-6" aria-hidden />
                  <span className="text-[11.5px] font-semibold">Cover photo (wide)</span>
                </>
              )}
            </label>
          </div>
        </FormCard>

        <FormCard step={3} title="Where and when">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="District" htmlFor="cs-district" error={errors.district}>
              <FormSelect id="cs-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose district" icon={<MapPin className="size-4" aria-hidden />} invalid={Boolean(errors.district)} />
            </Field>
            <Field label="Town / area" htmlFor="cs-town" optional>
              <TextInput id="cs-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Aliabad" />
            </Field>
          </div>
          <Field label="Bazaar" htmlFor="cs-bazaar" optional hint="Shops in a bazaar also show on that bazaar's page.">
            <FormSelect id="cs-bazaar" name="bazaar" label="Bazaar" options={bazaarOptions} value={bazaar} onChange={setBazaar} placeholder="Not in a bazaar" icon={<Store className="size-4" aria-hidden />} />
          </Field>
          <Field label="Open days">
            <Segmented
              name="days"
              label="Open days"
              value={days}
              onChange={setDays}
              options={[
                { value: "Mon – Sat", label: "Mon – Sat" },
                { value: "Daily", label: "Every day" },
                { value: "Sat – Thu", label: "Sat – Thu" },
              ]}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Opens at" htmlFor="cs-open">
              <TextInput id="cs-open" type="time" value={open} onChange={(e) => setOpen(e.target.value)} />
            </Field>
            <Field label="Closes at" htmlFor="cs-close">
              <TextInput id="cs-close" type="time" value={close} onChange={(e) => setClose(e.target.value)} />
            </Field>
          </div>
        </FormCard>

        <FormCard step={4} title="Selling online">
          <Toggle checked={delivery} onChange={setDelivery} Icon={Truck} label="We deliver" hint="Show a “Delivers” badge on your shop and products." />
          <Toggle checked={orders} onChange={setOrders} Icon={BadgeCheck} label="Take orders on REGOMARKET" hint="Buyers can order and pay on delivery. Needs a verified shop." />
          <Field label="About your shop" htmlFor="cs-about" optional hint="Your story, what makes you different, delivery areas.">
            <TextArea id="cs-about" rows={4} maxLength={800} value={about} onChange={(e) => setAbout(e.target.value)} />
          </Field>
        </FormCard>

        <FormCard step={5} title="Get the verified badge" sub="We call every shop before it gets the green tick.">
          <ul className="space-y-2.5 text-[13.5px] text-ink/80">
            <li className="flex items-start gap-2.5">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-mountain" aria-hidden /> Owner&apos;s CNIC (front and back)
            </li>
            <li className="flex items-start gap-2.5">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-mountain" aria-hidden /> A shop photo with the signboard, or a trade licence
            </li>
            <li className="flex items-start gap-2.5">
              <FileCheck2 className="mt-0.5 size-4 shrink-0 text-mountain" aria-hidden /> Your phone {phone} (already checked)
            </li>
          </ul>
          <p className="text-[12.5px] text-muted">You&apos;ll upload the documents after this step. They are never shown publicly.</p>
        </FormCard>
      </div>

      {/* Live storefront preview */}
      <aside className="space-y-4 lg:sticky lg:top-[96px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="relative h-28 bg-gradient-to-br from-mountain to-forest">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="size-full object-cover" />
            )}
            {delivery && (
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11.5px] font-semibold text-mountain">
                <Truck className="size-3.5" aria-hidden /> Delivers
              </span>
            )}
          </div>
          <div className="px-5 pb-5">
            <span className="-mt-8 grid size-16 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-mint text-[18px] font-bold text-mountain shadow">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="" className="size-full object-cover" />
              ) : (
                monogram(name)
              )}
            </span>
            <p className="mt-2 text-[17px] font-semibold text-ink">{name || "Your shop name"}</p>
            <p className="text-[13px] text-muted">{tagline || "One line about your shop"}</p>
            <p className="mt-2 text-[12.5px] text-muted">
              {[town, district && districtOptions.find((d) => d.value === district)?.label].filter(Boolean).join(", ") || "Location"} · {days}
            </p>
          </div>
        </div>
        <button type="submit" className="flex h-12 w-full items-center justify-center rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover">
          Create shop
        </button>
        <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          Free to start, {ownerName.split(" ")[0]}. No card needed.
        </p>
      </aside>
    </form>
  );
}
