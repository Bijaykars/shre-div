import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { authenticateRequest } from "./auth";
import { saveImage } from "./lib/images";

export function registerUpload(app: Hono<{ Bindings: HttpBindings }>) {
  // Serve previously uploaded files in production; in dev Vite serves public/ itself.
  app.use("/uploads/*", serveStatic({ root: "./public" }));

  app.post("/api/upload", async (c) => {
    const user = await authenticateRequest(c.req.raw.headers);
    if (user?.role !== "admin") return c.json({ error: "Forbidden" }, 403);

    const file = (await c.req.parseBody())["file"];
    if (!(file instanceof File)) return c.json({ error: "No file" }, 400);

    const result = await saveImage(file);
    return "error" in result ? c.json(result, 400) : c.json(result);
  });
}
