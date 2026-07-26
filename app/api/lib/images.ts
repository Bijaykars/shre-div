import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

// ponytail: local disk. Set UPLOAD_DIR to a mounted persistent volume on hosts
// whose filesystem resets between deploys (Railway volume, Render disk) —
// otherwise every image the shop uploads disappears on the next deploy. On a
// fully ephemeral host with no volume option, swap the writeFile below for an
// S3 PutObject instead.
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(process.cwd(), "public/uploads");
const MAX_BYTES = 8 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/gif": ".gif",
};

/** Validates and writes one image. Returns its public URL, or an error message. */
export async function saveImage(
  file: File,
  dir = UPLOAD_DIR,
): Promise<{ url: string } | { error: string }> {
  // Trust the MIME type over the filename — a .jpg that is really an SVG must not pass.
  const ext = EXT[file.type];
  if (!ext) return { error: "Only JPG, PNG, WebP, AVIF or GIF images" };
  if (file.size > MAX_BYTES) return { error: "Image must be under 8MB" };

  await fs.mkdir(dir, { recursive: true });
  const name = `${nanoid(12)}${ext}`;
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}
