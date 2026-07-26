import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

// ponytail: local disk under public/uploads. Uploads live outside the build, so
// they survive redeploys on a VPS but NOT on ephemeral hosts (Vercel/Fly) —
// swap the writeFile below for an S3 PutObject if the store moves to one.
export const UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads");
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
