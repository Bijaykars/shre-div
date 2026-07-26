import fs from "fs/promises";
import path from "path";
import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { authenticateRequest } from "./auth";
import { saveImage, UPLOAD_DIR } from "./lib/images";

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

// Filenames we generate are nanoid + known extension. Anything else is refused
// outright, so no request can path-traverse out of UPLOAD_DIR.
const SAFE_NAME = /^[A-Za-z0-9_-]{1,64}\.(jpg|png|webp|avif|gif)$/;

export function registerUpload(app: Hono<{ Bindings: HttpBindings }>) {
  // Served from UPLOAD_DIR rather than ./public so a mounted volume works.
  app.get("/uploads/:name", async (c) => {
    const name = c.req.param("name");
    if (!SAFE_NAME.test(name)) return c.json({ error: "Not Found" }, 404);

    try {
      const file = await fs.readFile(path.join(UPLOAD_DIR, name));
      return c.body(file, 200, {
        "Content-Type": CONTENT_TYPE[path.extname(name)] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      });
    } catch {
      return c.json({ error: "Not Found" }, 404);
    }
  });

  app.post("/api/upload", async (c) => {
    const user = await authenticateRequest(c.req.raw.headers);
    if (user?.role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const file = (await c.req.parseBody())["file"];
    if (!(file instanceof File)) return c.json({ error: "No file" }, 400);

    const result = await saveImage(file);
    return "error" in result ? c.json(result, 400) : c.json(result);
  });
}
