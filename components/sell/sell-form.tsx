"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Check, CheckCircle2, ImagePlus, MapPin, Phone, ShieldCheck, Star, X } from "lucide-react";
import type { CategorySlug, PriceUnit } from "@/types";
import { categories } from "@/data/categories";
import { districtOptions } from "@/lib/options";
import { CategoryIcon } from "@/components/common/category-icon";
import { Field, FormCard, Segmented, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 8;

const UNITS: Partial<Record<CategorySlug, { value: PriceUnit | ""; label: string }[]>> = {
  "dry-fruits": [
    { value: "kg", label: "per KG" },
    { value: "maund", label: "per Maund (40 KG)" },
    { value: "piece", label: "per pack" },
    { value: "bottle", label: "per bottle" },
    { value: "litre", label: "per litre" },
  ],
  agriculture: [
    { value: "kg", label: "per KG" },
    { value: "maund", label: "per Maund" },
    { value: "", label: "Total price" },
  ],
  property: [
    { value: "", label: "Total price" },
    { value: "month", label: "Rent per month" },
    { value: "kanal", label: "per Kanal" },
  ],
  services: [
    { value: "day", label: "per day" },
    { value: "", label: "Fixed price" },
  ],
  "cameras-gear": [
    { value: "", label: "Sale price" },
    { value: "day", label: "Rent per day" },
  ],
};

const HAS_CONDITION = new Set<CategorySlug>(["electronics", "vehicles", "home", "cameras-gear", "machinery"]);

type Photo = { id: string; url: string; name: string };
type Errors = Partial<Record<"category" | "photos" | "title" | "price" | "district", string>>;

export interface SellInitial {
  category?: CategorySlug;
  title?: string;
  description?: string;
  price?: string;
  unit?: PriceUnit | "";
  negotiable?: boolean;
  condition?: string;
  district?: string;
  town?: string;
  photos?: string[];
}

/**
 * Post (or edit) an ad. One page, five short sections, a live preview.
 * Photos stay in the browser until uploads go to Cloudinary/Supabase Storage.
 */
export function SellForm({ initial, editing, phone }: { initial?: SellInitial; editing?: boolean; phone: string }) {
  const [category, setCategory] = useState<CategorySlug | "">(initial?.category ?? "");
  const [photos, setPhotos] = useState<Photo[]>(() => (initial?.photos ?? []).map((url, i) => ({ id: `init-${i}`, url, name: "" })));
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [condition, setCondition] = useState(initial?.condition ?? "used");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [unit, setUnit] = useState<PriceUnit | "">(initial?.unit ?? "");
  const [negotiable, setNegotiable] = useState(initial?.negotiable ?? false);
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [town, setTown] = useState(initial?.town ?? "");
  const [whatsapp, setWhatsapp] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Free object URLs when leaving
  const photosRef = useRef(photos);
  photosRef.current = photos;
  useEffect(() => () => photosRef.current.forEach((p) => p.url.startsWith("blob:") && URL.revokeObjectURL(p.url)), []);

  const units = category ? UNITS[category] : undefined;
  const cat = categories.find((c) => c.slug === category);

  const addFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;
    const next = files.slice(0, room).map((f) => ({ id: `${f.name}-${f.size}-${Math.random()}`, url: URL.createObjectURL(f), name: f.name }));
    setPhotos((ps) => [...ps, ...next]);
    setErrors((er) => ({ ...er, photos: undefined }));
    e.target.value = "";
  };
  const removePhoto = (id: string) => setPhotos((ps) => ps.filter((p) => p.id !== id));
  const makeCover = (id: string) => setPhotos((ps) => [...ps.filter((p) => p.id === id), ...ps.filter((p) => p.id !== id)]);

  const pickCategory = (slug: CategorySlug) => {
    setCategory(slug);
    setUnit(UNITS[slug]?.[0]?.value ?? "");
    setErrors((er) => ({ ...er, category: undefined }));
  };

  const steps = [
    { label: "Category", ok: Boolean(category) },
    { label: "Photos", ok: photos.length > 0 },
    { label: "Details", ok: title.trim().length >= 5 },
    { label: "Price", ok: Number(price) > 0 },
    { label: "Location", ok: Boolean(district) },
  ];
  const progress = steps.filter((s) => s.ok).length;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!category) next.category = "Choose what you're selling.";
    if (!photos.length) next.photos = "Add at least one photo. Ads with photos get far more replies.";
    if (title.trim().length < 5) next.title = "Write a short title, at least 5 letters.";
    if (!(Number(price) > 0)) next.price = "Enter a price in rupees.";
    if (!district) next.district = "Choose your district.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`sec-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-14 text-success" aria-hidden />
        <h2 className="mt-3 text-[24px] font-bold tracking-[-0.02em] text-ink">{editing ? "Changes saved" : "Your ad is posted"}</h2>
        <p className="mt-2 text-[14.5px] text-muted">
          &ldquo;{title}&rdquo; is being checked and will go live within 2 hours. We&apos;ll send you a notification.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard" className="inline-flex h-11 items-center rounded-full bg-mountain px-6 text-[14px] font-semibold text-white">
            Go to my ads
          </Link>
          <button
            type="button"
            onClick={() => {
              setDone(false);
              setCategory("");
              setPhotos([]);
              setTitle("");
              setDescription("");
              setPrice("");
              setNegotiable(false);
            }}
            className="inline-flex h-11 items-center rounded-full border border-line-strong px-6 text-[14px] font-semibold text-ink"
          >
            Post another ad
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="space-y-5">
        {/* 1 — Category */}
        <div id="sec-category">
          <FormCard step={1} title="What are you selling?" sub="Pick the closest category.">
            <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
              {categories.map((c) => {
                const on = category === c.slug;
                return (
                  <li key={c.slug}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => pickCategory(c.slug)}
                      className={cn(
                        "flex h-full w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors",
                        on ? "border-mountain bg-mint ring-1 ring-mountain" : "border-line hover:border-ink/40",
                      )}
                    >
                      <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-stone">
                        {c.image?.src ? (
                          <Image src={c.image.src} alt="" fill sizes="40px" className="object-cover" />
                        ) : (
                          <CategoryIcon icon={c.icon} size={20} className="text-mountain" />
                        )}
                      </span>
                      <span className={cn("text-[13px] font-medium leading-tight", on ? "text-mountain" : "text-ink")}>{c.shortName}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {errors.category && <p className="text-[12.5px] font-medium text-[#b42318]">{errors.category}</p>}
          </FormCard>
        </div>

        {/* 2 — Photos */}
        <div id="sec-photos">
          <FormCard step={2} title="Add photos" sub={`Up to ${MAX_PHOTOS}. The first photo is the cover. Daylight photos sell faster.`}>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={addFiles} className="sr-only" id="photo-input" />
            <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {photos.map((p, i) => (
                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-xl bg-stone">
                  {/* Blob URLs can't go through next/image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name || `Photo ${i + 1}`} className="size-full object-cover" />
                  {i === 0 ? (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/85 px-2 py-0.5 text-[10.5px] font-semibold text-white">Cover</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeCover(p.id)}
                      className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10.5px] font-semibold text-ink opacity-100 shadow-sm md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Star className="size-3" aria-hidden /> Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(p.id)}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/95 text-ink shadow-sm hover:bg-white"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
              {photos.length < MAX_PHOTOS && (
                <li>
                  <label
                    htmlFor="photo-input"
                    className={cn(
                      "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center transition-colors hover:bg-cream",
                      errors.photos ? "border-[#d92d20] text-[#b42318]" : "border-line-strong text-muted",
                    )}
                  >
                    {photos.length ? <ImagePlus className="size-6" aria-hidden /> : <Camera className="size-7" aria-hidden />}
                    <span className="px-2 text-[12px] font-semibold">{photos.length ? "Add more" : "Add photos"}</span>
                    <span className="text-[11px]">
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  </label>
                </li>
              )}
            </ul>
            {errors.photos && <p className="text-[12.5px] font-medium text-[#b42318]">{errors.photos}</p>}
          </FormCard>
        </div>

        {/* 3 — Details */}
        <div id="sec-title">
          <FormCard step={3} title="Describe it">
            <Field label="Ad title" htmlFor="s-title" error={errors.title} hint={`${title.length}/70 · e.g. “Hunza dried apricots, new crop”`}>
              <TextInput id="s-title" value={title} maxLength={70} onChange={(e) => setTitle(e.target.value)} invalid={Boolean(errors.title)} placeholder="What is it?" />
            </Field>
            {category && HAS_CONDITION.has(category) && (
              <Field label="Condition">
                <Segmented
                  name="condition"
                  label="Condition"
                  value={condition}
                  onChange={setCondition}
                  options={[
                    { value: "new", label: "New" },
                    { value: "like-new", label: "Like new" },
                    { value: "used", label: "Used" },
                  ]}
                />
              </Field>
            )}
            <Field label="Description" htmlFor="s-desc" optional hint="Size, quality, age, why you're selling. Honest ads get better buyers.">
              <TextArea id="s-desc" rows={5} maxLength={1500} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </FormCard>
        </div>

        {/* 4 — Price */}
        <div id="sec-price">
          <FormCard step={4} title="Set your price">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Field label="Price" htmlFor="s-price" error={errors.price}>
                <div
                  className={cn(
                    "flex h-12 items-center rounded-xl border bg-white px-4 focus-within:border-mountain focus-within:shadow-[0_0_0_4px_rgb(6_78_59/0.1)]",
                    errors.price ? "border-[#d92d20]" : "border-line-strong",
                  )}
                >
                  <span className="text-[15px] font-semibold text-muted">Rs</span>
                  <input
                    id="s-price"
                    inputMode="numeric"
                    value={price ? Number(price).toLocaleString("en-US") : ""}
                    onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                    placeholder="0"
                    aria-invalid={Boolean(errors.price) || undefined}
                    className="h-full min-w-0 flex-1 bg-transparent px-2 text-[16px] font-semibold text-ink outline-none"
                  />
                </div>
              </Field>
              {units && (
                <Field label="Price is">
                  <Segmented name="unit" label="Price unit" value={unit} onChange={setUnit} options={units} />
                </Field>
              )}
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="size-5 accent-mountain" />
              <span className="text-[14px] text-ink">Price is negotiable</span>
            </label>
          </FormCard>
        </div>

        {/* 5 — Location & contact */}
        <div id="sec-district">
          <FormCard step={5} title="Where is it?" sub="Buyers see your town, never your address.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="District" htmlFor="s-district" error={errors.district}>
                <FormSelect id="s-district" name="district" label="District" options={districtOptions} value={district} onChange={setDistrict} placeholder="Choose district" icon={<MapPin className="size-4" aria-hidden />} invalid={Boolean(errors.district)} />
              </Field>
              <Field label="Town / area" htmlFor="s-town" optional>
                <TextInput id="s-town" value={town} onChange={(e) => setTown(e.target.value)} placeholder="e.g. Jutial, Aliabad" />
              </Field>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <p className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                <Phone className="size-4 text-muted" aria-hidden /> {phone}
              </p>
              <p className="mt-0.5 text-[12.5px] text-muted">Hidden until a signed-in buyer taps “Show phone”.</p>
              <label className="mt-3 flex cursor-pointer items-center gap-3">
                <input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} className="size-5 accent-mountain" />
                <span className="text-[14px] text-ink">Buyers can contact me on WhatsApp</span>
              </label>
            </div>
          </FormCard>
        </div>
      </div>

      {/* Preview + progress */}
      <aside className="space-y-4 lg:sticky lg:top-[96px]">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[12.5px] font-medium text-muted">How buyers will see it</p>
          <div className="mt-3 overflow-hidden rounded-xl bg-[#f3f1ec]">
            <div className="relative aspect-square">
              {photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photos[0].url} alt="" className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center text-muted">
                  <Camera className="size-9" aria-hidden />
                </div>
              )}
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-[14.5px] font-medium text-ink">{title || "Your ad title"}</p>
          <p className="mt-1 text-ink">
            <span className="text-[13px] font-semibold">Rs </span>
            <span className="text-[19px] font-bold">{price ? Number(price).toLocaleString("en-US") : "0"}</span>
            {unit && <span className="text-[13px] text-muted"> / {units?.find((u) => u.value === unit)?.label.replace(/^per /, "").replace(/^Rent per /, "")}</span>}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">
            {cat?.shortName ?? "Category"} · {district ? districtOptions.find((d) => d.value === district)?.label : "Location"}
            {negotiable && " · Negotiable"}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink">Ready to post</span>
            <span className="text-muted">
              {progress}/{steps.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone">
            <div className="h-full rounded-full bg-mountain transition-[width] duration-300" style={{ width: `${(progress / steps.length) * 100}%` }} />
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-[12.5px]">
            {steps.map((s) => (
              <li key={s.label} className={cn("flex items-center gap-1.5", s.ok ? "text-success" : "text-muted")}>
                <span className={cn("grid size-4 place-items-center rounded-full", s.ok ? "bg-success text-white" : "border border-line-strong")}>
                  {s.ok && <Check className="size-3" strokeWidth={3} aria-hidden />}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="flex h-12 w-full items-center justify-center rounded-full bg-mountain text-[15px] font-semibold text-white hover:bg-mountain-hover">
          {editing ? "Save changes" : "Post ad for free"}
        </button>
        <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          By posting you agree to our rules: real items, real photos, no prohibited goods.
        </p>
      </aside>
    </form>
  );
}
