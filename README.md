# Shré~Div

Storefront and admin console for a children's shop in Lalitpur, Nepal — clothing,
toys and nursery gear.

Everything on the site is editable from `/admin` without touching code: products,
collections, hero slides, testimonials, homepage copy and images.

## Stack

React 19 + Vite · tRPC · Drizzle ORM + MySQL · Hono · Tailwind + shadcn/ui · Lenis

## Running it locally

Everything below runs from `app/`.

```bash
cd app && npm install --legacy-peer-deps
```

Start MySQL (any 8.x instance works; Docker is the quickest):

```bash
docker run -d --name shrediv-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=shrediv mysql:8
```

Copy `.env.example` to `.env` and fill it in. `SESSION_SECRET` signs the admin
session cookie and must be at least 32 characters — the app refuses to start
otherwise:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create the tables and load the sample catalogue:

```bash
npm run db:push && npx tsx db/seed.ts
```

Create an admin, then sign in at `/login`:

```bash
npx tsx scripts/set-admin.ts <username> <password>
```

```bash
npm run dev
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Vite dev server on :3000 |
| `npm run build` | Client bundle + bundled API server |
| `npm run check` | TypeScript |
| `npm test` | Vitest |
| `npm run db:push` | Sync schema to the database |
| `npx tsx db/seed.ts` | Seed the sample catalogue (skips if already seeded) |
| `npx tsx scripts/set-admin.ts <user> <pass>` | Create an admin or reset a password |
| `python scripts/optimize-images.py <path>` | Convert PNGs to web-weight JPEGs |

## Deploying

This is a long-running Node server with a MySQL database and disk-backed image
uploads — not a static site and not serverless. It needs a host that runs a
persistent process **and** gives you a mountable disk. Render and Railway both do.

Two settings matter on any host:

- **Root directory is `app/`**, not the repo root.
- **`UPLOAD_DIR` must point at a mounted volume.** Without it, uploads land on
  the container filesystem and every image the shop uploaded is wiped on the
  next deploy.

`render.yaml` at the repo root encodes all of this. In Render choose
*New > Blueprint* and point it at this repo; it will prompt for `DATABASE_URL`
and generate `SESSION_SECRET` itself.

On Railway: set the service root directory to `app`, add a volume mounted at
`/var/data/uploads`, and set `UPLOAD_DIR=/var/data/uploads`, `DATABASE_URL` and
`SESSION_SECRET`.

After the first deploy, run the schema push and create an admin against the
production database:

```bash
npm run db:push
npx tsx scripts/set-admin.ts <username> <password>
```

Vercel is a poor fit: its filesystem is ephemeral, so admin image uploads would
disappear on every deploy. Going that route means converting the Hono server to
a serverless function and replacing `saveImage` with S3 or Vercel Blob.

## Notes

Admin image uploads write to `UPLOAD_DIR` (default `app/public/uploads`), which
is gitignored.

Product age ranges are stored in months (`ageMinMonths` / `ageMaxMonths`) so
clothing and toys share one scale; a null max means open-ended.
