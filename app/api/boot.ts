import { pathToFileURL } from "url";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { registerUpload } from "./upload";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
registerUpload(app);
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

// Start the server whenever this file is executed directly (`node dist/boot.js`).
// Deliberately NOT gated on NODE_ENV: a host that forgets to set it would
// otherwise run a process that listens on nothing and fail healthchecks with no
// error in the log. Under `vite dev` this module is imported, not executed, so
// the check is false and Vite keeps serving.
const executedDirectly =
  !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (executedDirectly) {
  // Required-env validation lives in lib/env.ts: it runs during the import graph,
  // long before this line, so checking again here would be dead code.
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  // 0.0.0.0 so container platforms can reach it from outside the container.
  serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, () => {
    console.log(`Server listening on 0.0.0.0:${port}`);
  });
}
