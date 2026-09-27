"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, LayoutGrid, MapPin, Megaphone } from "lucide-react";
import { Field, FormCard, Segmented, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { categoryOptions, districtOptions } from "@/lib/options";

type Mode = "Retail" | "Wholesale" | "Bulk" | "Rent";
type Errors = Partial<Record<"title" | "category" | "district", string>>;

/** Post a Wanted request. Saves locally until Supabase is connected. */
export function WantedForm({ initialTitle = "" }: { initialTitle?: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState("");
  const [mode, setMode] = useState<Mode>("Retail");
  const [quantity, setQuantity] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [needBy, setNeedBy] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (title.trim().length < 5) next.title = "Say what you need in a few words, e.g. “50 KG dried apricots”.";
    if (!category) next.category = "Pick a category so the right sellers see it.";
    if (!district) next.district = "Pick your district.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(Object.keys(next)[0] === "title" ? "w-title" : Object.keys(next)[0] === "category" ? "w-category" : "w-district")?.focus();
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h2 className="mt-3 text-[22px] font-semibold text-ink">Your request is live</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          Sellers who have &ldquo;{title}&rdquo; will send you offers. We&apos;ll notify you on every new offer.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/wanted" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
            See all requests
          </Link>
          <Link href="/messages" className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink">
            Open messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-5">
        <FormCard step={1} title="What do you need?">
          <Field label="Title" htmlFor="w-title" error={errors.title} hint="Keep it short and clear.">
            <TextInput id="w-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={70} placeholder="e.g. 200 KG pure honey for a hotel" invalid={Boolean(errors.title)} />
          </Field>
          <Field label="Category" htmlFor="w-category" error={errors.category}>
            <FormSelect id="w-category" name="category" label="Category" options={categoryOptions} value={category} onChange={setCategory} placeholder="Choose a category" icon={<LayoutGrid className="size-4" aria-hidden />} invalid={Boolean(errors.category)} />
          </Field>
          <Field label="Type of deal">
            <Segmented
              name="mode"
              label="Type of deal"
              value={mode}
              onChange={setMode}
              options={[
                { value: "Retail", label: "Just for me" },
                { value: "Wholesale", label: "Wholesale" },
                { value: "Bulk", label: "Bulk / many" },
                { value: "Rent", label: "To rent" },
              ]}
            />
          </Field>
          <Field label="Quantity" htmlFor="w-qty" optional>
            <TextInput id="w-qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g. 500 KG, 20 animals, 1 piece" />
          </Field>
        </FormCard>

        <FormCard step={2} title="Budget and place">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Budget from (Rs)" htmlFor="w-min" optional>
              <TextInput id="w-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" />
            </Field>
            <Field label="Budget up to (Rs)" htmlFor="w-max" optional>
              <TextInput id="w-max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d]/g, ""))} placeholder="Leave empty if open" />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="District" htmlFor="w-district" error={errors.district}>
              <FormSelect id="w-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose district" icon={<MapPin className="size-4" aria-hidden />} invalid={Boolean(errors.district)} />
            </Field>
            <Field label="Town / area" htmlFor="w-town" optional>
              <TextInput id="w-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Jutial" />
            </Field>
          </div>
          <Field label="When do you need it?" htmlFor="w-need" optional>
            <TextInput id="w-need" value={needBy} onChange={(e) => setNeedBy(e.target.value)} placeholder="e.g. This week, before Eid" />
          </Field>
          <Field label="More details" htmlFor="w-details" optional hint="Quality, size, delivery, anything sellers should know.">
            <TextArea id="w-details" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} maxLength={600} />
          </Field>
        </FormCard>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-[96px]">
        <div className="rounded-2xl border border-line p-5">
          <p className="text-[12.5px] font-medium text-muted">Preview</p>
          <p className="mt-2 inline-flex rounded-full bg-[#fdeee8] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#c2410c]">Wanted · {mode}</p>
          <p className="mt-2 text-[16px] font-semibold leading-snug text-ink">{title || "Your request title"}</p>
          <p className="mt-1 text-[13px] text-muted">
            {quantity || "Any quantity"} · {district ? districtOptions.find((d) => d.value === district)?.label : "Your district"}
          </p>
          <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[14px] font-bold text-mountain">
            {min || max ? `Rs ${min ? Number(min).toLocaleString("en-US") : "0"}${max ? ` – ${Number(max).toLocaleString("en-US")}` : "+"}` : "Budget: open to offers"}
          </p>
        </div>
        <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover">
          <Megaphone className="size-[18px]" aria-hidden /> Post request
        </button>
        <p className="px-1 text-center text-[12.5px] text-muted">Free. Your phone number stays hidden until you reply.</p>
      </aside>
    </form>
  );
}
