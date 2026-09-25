import type { District } from "@/types";
import { cn } from "@/lib/utils";

/**
 * GB-only location selector. Districts grouped by division; data comes from
 * lib/data so new districts/tehsils appear without component changes.
 * Native <select> = accessible, zero JS, familiar on every phone.
 */
export function LocationSelector({
  districts,
  name = "district",
  id,
  defaultValue = "",
  allLabel = "All Gilgit-Baltistan",
  className,
}: {
  districts: District[];
  name?: string;
  id?: string;
  defaultValue?: string;
  allLabel?: string;
  className?: string;
}) {
  const divisions = ["Gilgit", "Baltistan", "Diamer"] as const;
  return (
    <select id={id} name={name} defaultValue={defaultValue} className={cn("select-native", className)}>
      <option value="">{allLabel}</option>
      {divisions.map((div) => (
        <optgroup key={div} label={`${div} Division`}>
          {districts
            .filter((d) => d.division === div)
            .map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
