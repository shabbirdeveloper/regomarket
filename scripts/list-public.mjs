/**
 * Writes lib/public-files.json — the list of files in /public.
 * lib/media.ts uses it to show a placeholder for photos that haven't been
 * added yet. (On AWS the server can't see /public, so it can't check disk.)
 * Runs automatically before `next dev` and `next build`.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push("/" + relative(pub, p).split(sep).join("/"));
  }
};
walk(pub);
files.sort();
writeFileSync(join(root, "lib", "public-files.json"), JSON.stringify(files, null, 2) + "\n");
console.log(`public-files.json: ${files.length} files`);
