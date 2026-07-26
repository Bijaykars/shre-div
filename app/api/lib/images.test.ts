import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { saveImage } from "./images";

let dir: string;

beforeAll(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "upload-test-"));
});
afterAll(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

test("writes an accepted image and returns its public URL", async () => {
  const result = await saveImage(new File(["fake-jpeg-bytes"], "a.jpg", { type: "image/jpeg" }), dir);
  expect(result).toHaveProperty("url");

  const url = (result as { url: string }).url;
  expect(url).toMatch(/^\/uploads\/[\w-]{12}\.jpg$/);
  expect(await fs.readFile(path.join(dir, path.basename(url)), "utf-8")).toBe("fake-jpeg-bytes");
});

test("derives the extension from the MIME type, not the filename", async () => {
  // A file named .jpg that is really a PNG must land as .png.
  const result = await saveImage(new File(["x"], "sneaky.jpg", { type: "image/png" }), dir);
  expect((result as { url: string }).url).toMatch(/\.png$/);
});

test("rejects non-image types", async () => {
  const before = (await fs.readdir(dir)).length;
  const result = await saveImage(new File(["<script>"], "x.svg", { type: "image/svg+xml" }), dir);
  expect(result).toEqual({ error: "Only JPG, PNG, WebP, AVIF or GIF images" });
  expect(await fs.readdir(dir)).toHaveLength(before); // nothing written
});

test("rejects images over 8MB", async () => {
  const big = new File([new Uint8Array(8 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
  expect(await saveImage(big, dir)).toEqual({ error: "Image must be under 8MB" });
});

test("gives each upload a unique name", async () => {
  const a = await saveImage(new File(["x"], "same.png", { type: "image/png" }), dir);
  const b = await saveImage(new File(["x"], "same.png", { type: "image/png" }), dir);
  expect((a as { url: string }).url).not.toBe((b as { url: string }).url);
});
