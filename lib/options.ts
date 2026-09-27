import type { SelectOption } from "@/components/search/select-menu";
import { categories } from "@/data/categories";
import { districts } from "@/data/locations";

/** Ready-made option lists for SelectMenu inside forms (client-safe). */
export const categoryOptions: SelectOption[] = categories.map((c) => ({
  value: c.slug,
  label: c.name,
  thumb: c.image?.src ?? undefined,
}));

export const districtOptions: SelectOption[] = (["Gilgit", "Baltistan", "Diamer"] as const).flatMap((div) =>
  districts
    .filter((d) => d.division === div)
    .map((d) => ({ value: d.slug, label: d.name, hint: d.headquarters, group: `${div} Division` })),
);
