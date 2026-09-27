import type { ReactNode } from "react";
import type { Category, District } from "@/types";
import type { SearchQuery, SearchResult } from "@/lib/data";
import { cn } from "@/lib/utils";

const nf = new Intl.NumberFormat("en-US");

function Section({ title, children, open = true }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line py-4 last:border-b-0 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold text-ink">
        {title}
        <span aria-hidden className="text-[18px] font-normal leading-none text-muted transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

const rowCls =
  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-[7px] text-[13.5px] text-ink/85 transition-colors hover:bg-stone has-[:checked]:bg-mint has-[:checked]:font-semibold has-[:checked]:text-mountain";

function Radio({
  name,
  value,
  checked,
  label,
  count,
  prefix,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: ReactNode;
  count?: number;
  prefix: string;
}) {
  const dim = count === 0 && !checked;
  return (
    <label className={cn(rowCls, dim && "text-muted/70")}>
      <span className="flex min-w-0 items-center gap-2.5">
        <input
          type="radio"
          name={name}
          value={value}
          defaultChecked={checked}
          id={`${prefix}-${name}-${value || "any"}`}
          className="size-4 shrink-0 accent-mountain"
        />
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && <span className="shrink-0 text-[12px] font-normal tabular-nums text-muted">{count}</span>}
    </label>
  );
}

function Check({ name, checked, label, hint, prefix }: { name: string; checked: boolean; label: string; hint?: string; prefix: string }) {
  return (
    <label className={rowCls}>
      <span className="flex min-w-0 items-start gap-2.5">
        <input
          type="checkbox"
          name={name}
          value="1"
          defaultChecked={checked}
          id={`${prefix}-${name}`}
          className="mt-0.5 size-4 shrink-0 accent-mountain"
        />
        <span>
          {label}
          {hint && <span className="block text-[11.5px] font-normal text-muted">{hint}</span>}
        </span>
      </span>
    </label>
  );
}

/**
 * The filter fields (server-rendered). Wrapped by <FilterForm> in the desktop
 * sidebar and again in the phone sheet — `prefix` keeps the ids unique.
 */
export function SearchFilters({
  query,
  result,
  categories,
  districts,
  prefix,
}: {
  query: SearchQuery;
  result: SearchResult;
  categories: Category[];
  districts: District[];
  prefix: string;
}) {
  const { facets } = result;
  const catTotal = Object.values(facets.categories).reduce((a, b) => a + (b ?? 0), 0);
  const distTotal = Object.values(facets.districts).reduce((a, b) => a + (b ?? 0), 0);
  const divisions = ["Gilgit", "Baltistan", "Diamer"] as const;

  return (
    <div>
      {query.q && <input type="hidden" name="q" value={query.q} />}
      {query.sort && <input type="hidden" name="sort" value={query.sort} />}

      <Section title="Category">
        <div className="space-y-0.5">
          <Radio prefix={prefix} name="category" value="" checked={!query.category} label="All categories" count={catTotal} />
          {categories.map((c) => (
            <Radio
              key={c.slug}
              prefix={prefix}
              name="category"
              value={c.slug}
              checked={query.category === c.slug}
              label={c.shortName}
              count={facets.categories[c.slug] ?? 0}
            />
          ))}
        </div>
      </Section>

      <Section title="Location">
        <div className="space-y-0.5">
          <Radio prefix={prefix} name="district" value="" checked={!query.district} label="All Gilgit-Baltistan" count={distTotal} />
          {divisions.map((div) => (
            <div key={div}>
              <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{div} Division</p>
              {districts
                .filter((d) => d.division === div)
                .map((d) => (
                  <Radio
                    key={d.slug}
                    prefix={prefix}
                    name="district"
                    value={d.slug}
                    checked={query.district === d.slug}
                    label={d.name}
                    count={facets.districts[d.slug] ?? 0}
                  />
                ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Price (Rs)">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${prefix}-min`}>
            Minimum price
          </label>
          <input
            id={`${prefix}-min`}
            name="min"
            inputMode="numeric"
            defaultValue={query.min ?? ""}
            placeholder="Min"
            className="h-10 w-full min-w-0 rounded-lg border border-line-strong bg-white px-3 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-mountain"
          />
          <span className="text-muted" aria-hidden>
            –
          </span>
          <label className="sr-only" htmlFor={`${prefix}-max`}>
            Maximum price
          </label>
          <input
            id={`${prefix}-max`}
            name="max"
            inputMode="numeric"
            defaultValue={query.max ?? ""}
            placeholder="Max"
            className="h-10 w-full min-w-0 rounded-lg border border-line-strong bg-white px-3 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-mountain"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-lg bg-ink px-3.5 text-[13px] font-semibold text-white hover:bg-ink/85"
          >
            Go
          </button>
        </div>
        {result.priceRange && (
          <p className="mt-2 text-[11.5px] text-muted">
            These ads range from Rs {nf.format(result.priceRange.min)} to Rs {nf.format(result.priceRange.max)}
          </p>
        )}
      </Section>

      <Section title="Seller">
        <div className="space-y-0.5">
          <Radio prefix={prefix} name="seller" value="" checked={!query.seller} label="Anyone" />
          <Radio prefix={prefix} name="seller" value="shop" checked={query.seller === "shop"} label="Shops" count={facets.seller.shop} />
          <Radio
            prefix={prefix}
            name="seller"
            value="individual"
            checked={query.seller === "individual"}
            label="Individuals"
            count={facets.seller.individual}
          />
        </div>
      </Section>

      <Section title="Condition" open={Boolean(query.condition)}>
        <div className="space-y-0.5">
          <Radio prefix={prefix} name="condition" value="" checked={!query.condition} label="Any" />
          <Radio prefix={prefix} name="condition" value="new" checked={query.condition === "new"} label="New" />
          <Radio prefix={prefix} name="condition" value="used" checked={query.condition === "used"} label="Used" />
        </div>
      </Section>

      <Section title="More options">
        <div className="space-y-0.5">
          <Check prefix={prefix} name="delivery" checked={Boolean(query.delivery)} label="Home delivery" hint="Order online from a verified shop" />
          <Check prefix={prefix} name="verified" checked={Boolean(query.verified)} label="Verified sellers only" hint="ID or business checked" />
          <Check prefix={prefix} name="wholesale" checked={Boolean(query.wholesale)} label="Wholesale / bulk" />
          <Check prefix={prefix} name="negotiable" checked={Boolean(query.negotiable)} label="Price negotiable" />
        </div>
      </Section>
    </div>
  );
}
