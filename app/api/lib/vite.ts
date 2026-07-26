import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // serveStatic resolves `root` against process.cwd(), but the bundle's location
  // is what we actually know. Derive one from the other so the assets are found
  // no matter which directory the host starts the process from — otherwise the
  // page loads with no CSS or JS, which is harder to diagnose than a clean crash.
  const relativeToCwd = path.relative(process.cwd(), distPath).split(path.sep).join("/");

  app.use("*", serveStatic({ root: relativeToCwd || "." }));

  app.notFound((c) => {
    const accept = c.req.header("accept") ?? "";
    if (!accept.includes("text/html")) {
      return c.json({ error: "Not Found" }, 404);
    }
    const indexPath = path.resolve(distPath, "index.html");
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}
