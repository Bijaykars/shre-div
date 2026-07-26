import { z } from "zod";
import { asc, count, desc, eq } from "drizzle-orm";
import { adminQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import {
  categories,
  heroSlides,
  newsletterSubscribers,
  orders,
  products,
  siteSettings,
  testimonials,
} from "@db/schema";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const productInput = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  details: z.string().optional(),
  price: z.number().int().min(0),
  compareAtPrice: z.number().int().min(0).nullable().optional(),
  categoryId: z.number(),
  image: z.string().optional().nullable(),
  hoverImage: z.string().optional().nullable(),
  badge: z.enum(["new", "bestseller", "limited"]).nullable().optional(),
  ageMinMonths: z.number().int().min(0).nullable().optional(),
  ageMaxMonths: z.number().int().min(0).nullable().optional(),
  sizes: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  stock: z.number().int().min(0),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
});

const categoryInput = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  department: z.enum(["clothing", "toys", "nursery"]),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

const slideInput = z.object({
  eyebrow: z.string().optional().nullable(),
  title: z.string().min(2),
  highlight: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

const testimonialInput = z.object({
  name: z.string().min(2),
  location: z.string().optional().nullable(),
  quote: z.string().min(5),
  rating: z.number().int().min(1).max(5),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});

export const adminRouter = createRouter({
  /* -------------------------------- Dashboard ------------------------------ */
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [[productCount], [orderCount], [newOrders], [subCount], [catCount]] =
      await Promise.all([
        db.select({ n: count() }).from(products),
        db.select({ n: count() }).from(orders),
        db.select({ n: count() }).from(orders).where(eq(orders.status, "new")),
        db.select({ n: count() }).from(newsletterSubscribers),
        db.select({ n: count() }).from(categories),
      ]);
    const recentOrders = await db.query.orders.findMany({
      orderBy: desc(orders.createdAt),
      limit: 6,
    });
    const lowStock = await db.query.products.findMany({
      with: { category: true },
      orderBy: asc(products.stock),
      limit: 6,
    });
    return {
      productCount: productCount.n,
      orderCount: orderCount.n,
      newOrders: newOrders.n,
      subCount: subCount.n,
      catCount: catCount.n,
      recentOrders,
      lowStock: lowStock.filter((p) => p.stock <= 8),
    };
  }),

  /* -------------------------------- Products ------------------------------- */
  products: createRouter({
    list: adminQuery.query(() =>
      getDb().query.products.findMany({
        with: { category: true },
        orderBy: desc(products.createdAt),
      }),
    ),
    create: adminQuery.input(productInput).mutation(async ({ input }) => {
      const { slug, ...rest } = input;
      await getDb()
        .insert(products)
        .values({ ...rest, slug: slug?.trim() || slugify(input.name) });
      return { ok: true };
    }),
    update: adminQuery
      .input(z.object({ id: z.number(), data: productInput }))
      .mutation(async ({ input }) => {
        const { slug, ...rest } = input.data;
        await getDb()
          .update(products)
          .set({ ...rest, slug: slug?.trim() || slugify(input.data.name) })
          .where(eq(products.id, input.id));
        return { ok: true };
      }),
    remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await getDb().delete(products).where(eq(products.id, input.id));
      return { ok: true };
    }),
  }),

  /* ------------------------------- Categories ------------------------------ */
  categories: createRouter({
    list: adminQuery.query(() =>
      getDb().query.categories.findMany({
        with: { products: true },
        orderBy: asc(categories.sortOrder),
      }),
    ),
    create: adminQuery.input(categoryInput).mutation(async ({ input }) => {
      const { slug, ...rest } = input;
      await getDb()
        .insert(categories)
        .values({ ...rest, slug: slug?.trim() || slugify(input.name) });
      return { ok: true };
    }),
    update: adminQuery
      .input(z.object({ id: z.number(), data: categoryInput }))
      .mutation(async ({ input }) => {
        const { slug, ...rest } = input.data;
        await getDb()
          .update(categories)
          .set({ ...rest, slug: slug?.trim() || slugify(input.data.name) })
          .where(eq(categories.id, input.id));
        return { ok: true };
      }),
    remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const db = getDb();
      const inUse = await db.query.products.findFirst({ where: eq(products.categoryId, input.id) });
      if (inUse) throw new Error("Category still has products — reassign or delete them first");
      await db.delete(categories).where(eq(categories.id, input.id));
      return { ok: true };
    }),
  }),

  /* --------------------------------- Slides -------------------------------- */
  slides: createRouter({
    list: adminQuery.query(() =>
      getDb().query.heroSlides.findMany({ orderBy: asc(heroSlides.sortOrder) }),
    ),
    create: adminQuery.input(slideInput).mutation(async ({ input }) => {
      await getDb().insert(heroSlides).values(input);
      return { ok: true };
    }),
    update: adminQuery
      .input(z.object({ id: z.number(), data: slideInput }))
      .mutation(async ({ input }) => {
        await getDb().update(heroSlides).set(input.data).where(eq(heroSlides.id, input.id));
        return { ok: true };
      }),
    remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await getDb().delete(heroSlides).where(eq(heroSlides.id, input.id));
      return { ok: true };
    }),
  }),

  /* ------------------------------ Testimonials ----------------------------- */
  testimonials: createRouter({
    list: adminQuery.query(() =>
      getDb().query.testimonials.findMany({ orderBy: asc(testimonials.sortOrder) }),
    ),
    create: adminQuery.input(testimonialInput).mutation(async ({ input }) => {
      await getDb().insert(testimonials).values(input);
      return { ok: true };
    }),
    update: adminQuery
      .input(z.object({ id: z.number(), data: testimonialInput }))
      .mutation(async ({ input }) => {
        await getDb().update(testimonials).set(input.data).where(eq(testimonials.id, input.id));
        return { ok: true };
      }),
    remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await getDb().delete(testimonials).where(eq(testimonials.id, input.id));
      return { ok: true };
    }),
  }),

  /* --------------------------------- Orders -------------------------------- */
  orders: createRouter({
    list: adminQuery.query(() =>
      getDb().query.orders.findMany({ orderBy: desc(orders.createdAt) }),
    ),
    setStatus: adminQuery
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "confirmed", "delivered", "cancelled"]),
        }),
      )
      .mutation(async ({ input }) => {
        await getDb().update(orders).set({ status: input.status }).where(eq(orders.id, input.id));
        return { ok: true };
      }),
  }),

  /* ------------------------------- Newsletter ------------------------------ */
  subscribers: createRouter({
    list: adminQuery.query(() =>
      getDb().query.newsletterSubscribers.findMany({
        orderBy: desc(newsletterSubscribers.createdAt),
      }),
    ),
    remove: adminQuery.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await getDb().delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, input.id));
      return { ok: true };
    }),
  }),

  /* -------------------------------- Settings ------------------------------- */
  settings: createRouter({
    all: adminQuery.query(async () => {
      const rows = await getDb().select().from(siteSettings);
      return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
    }),
    set: adminQuery
      .input(z.object({ entries: z.record(z.string(), z.string()) }))
      .mutation(async ({ input }) => {
        const db = getDb();
        for (const [key, value] of Object.entries(input.entries)) {
          await db
            .insert(siteSettings)
            .values({ key, value })
            .onDuplicateKeyUpdate({ set: { value } });
        }
        return { ok: true };
      }),
  }),
});
