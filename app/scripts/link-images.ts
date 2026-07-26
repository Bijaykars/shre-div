/**
 * Matches image files on disk to products by filename, and updates the database.
 *
 *   npx tsx scripts/link-images.ts            # preview only
 *   npx tsx scripts/link-images.ts --apply    # write to the database
 *
 * Drop files into public/images/products/ named after the product slug —
 * `wooden-balance-bike.jpg` matches the product with slug `wooden-balance-bike`.
 * A `-hover` suffix fills the hover image: `wooden-balance-bike-hover.jpg`.
 *
 * ponytail: filename matching instead of an import UI — the admin panel already
 * has per-product upload; this is only for bulk-loading a photoshoot at once.
 */
import fs from "fs/promises";
import path from "path";
import { eq } from "drizzle-orm";
import { getDb } from "../api/queries/connection";
import { products } from "../db/schema";

const DIR = path.resolve(process.cwd(), "public/images/products");
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const apply = process.argv.includes("--apply");

const files = await fs.readdir(DIR).catch(() => {
  console.error(`No such directory: ${DIR}`);
  process.exit(1);
});

// slug -> { image, hoverImage }
const byslug = new Map<string, { image?: string; hover?: string }>();
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (!EXTS.has(ext)) continue;
  const base = path.basename(f, ext);
  const isHover = base.endsWith("-hover");
  const slug = isHover ? base.slice(0, -"-hover".length) : base;
  const entry = byslug.get(slug) ?? {};
  entry[isHover ? "hover" : "image"] = `/images/products/${f}`;
  byslug.set(slug, entry);
}

const db = getDb();
const all = await db.select().from(products);

let matched = 0;
const unmatchedFiles = new Set(byslug.keys());

for (const p of all) {
  const found = byslug.get(p.slug);
  if (!found) continue;
  unmatchedFiles.delete(p.slug);

  const next = {
    image: found.image ?? p.image,
    hoverImage: found.hover ?? p.hoverImage,
  };
  if (next.image === p.image && next.hoverImage === p.hoverImage) continue;

  matched++;
  console.log(`${apply ? "updated" : "would update"}  ${p.slug}  ->  ${next.image}`);
  if (apply) await db.update(products).set(next).where(eq(products.id, p.id));
}

const missing = all.filter((p) => !p.image && !byslug.has(p.slug));
if (missing.length) {
  console.log(`\nStill without an image (${missing.length}):`);
  for (const p of missing) console.log(`  ${p.slug}`);
}
if (unmatchedFiles.size) {
  console.log(`\nFiles matching no product slug (${unmatchedFiles.size}):`);
  for (const s of unmatchedFiles) console.log(`  ${s}`);
}

console.log(
  `\n${matched} product${matched === 1 ? "" : "s"} ${apply ? "updated" : "would be updated"}.` +
    (apply ? "" : " Re-run with --apply to write."),
);
process.exit(0);
