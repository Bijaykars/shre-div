import { z } from "zod";
import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  categories,
  heroSlides,
  newsletterSubscribers,
  orders,
  products,
  siteSettings,
  testimonials,
  type OrderItem,
} from "@db/schema";

async function getSettingsMap() {
  const rows = await getDb().select().from(siteSettings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
}

export const storeRouter = createRouter({
  /** Everything the homepage needs in one round-trip. */
  home: publicQuery.query(async () => {
    const db = getDb();
    const [slides, cats, featured, bestsellers, latest, quotes, settings] =
      await Promise.all([
        db.query.heroSlides.findMany({
          where: eq(heroSlides.isActive, true),
          orderBy: asc(heroSlides.sortOrder),
        }),
        db.query.categories.findMany({
          where: eq(categories.isActive, true),
          orderBy: asc(categories.sortOrder),
        }),
        db.query.products.findMany({
          where: and(eq(products.isActive, true), eq(products.isFeatured, true)),
          with: { category: true },
          orderBy: desc(products.createdAt),
          limit: 8,
        }),
        db.query.products.findMany({
          where: and(eq(products.isActive, true), eq(products.badge, "bestseller")),
          with: { category: true },
          limit: 6,
        }),
        db.query.products.findMany({
          where: and(eq(products.isActive, true), eq(products.badge, "new")),
          with: { category: true },
          orderBy: desc(products.createdAt),
          limit: 6,
        }),
        db.query.testimonials.findMany({
          where: eq(testimonials.isActive, true),
          orderBy: asc(testimonials.sortOrder),
        }),
        getSettingsMap(),
      ]);
    return { slides, categories: cats, featured, bestsellers, latest, quotes, settings };
  }),

  categories: publicQuery.query(() =>
    getDb().query.categories.findMany({
      where: eq(categories.isActive, true),
      orderBy: asc(categories.sortOrder),
      with: { products: { where: eq(products.isActive, true) } },
    }),
  ),

  settings: publicQuery.query(() => getSettingsMap()),

  products: publicQuery
    .input(
      z.object({
        department: z.enum(["clothing", "toys", "nursery"]).optional(),
        ageMonths: z.number().int().min(0).optional(),
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(["newest", "price-asc", "price-desc", "name"]).default("newest"),
      }),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(products.isActive, true)];

      if (input.categorySlug) {
        const cat = await db.query.categories.findFirst({
          where: eq(categories.slug, input.categorySlug),
        });
        if (!cat) return { items: [], category: null };
        conditions.push(eq(products.categoryId, cat.id));
        const items = await db.query.products.findMany({
          where: and(...conditions),
          with: { category: true },
          orderBy: sortToOrder(input.sort),
        });
        return { items, category: cat };
      }

      if (input.search?.trim()) {
        const q = `%${input.search.trim()}%`;
        conditions.push(or(like(products.name, q), like(products.description, q))!);
      }

      let items = await db.query.products.findMany({
        where: and(...conditions),
        with: { category: true },
        orderBy: sortToOrder(input.sort),
      });

      if (input.department) {
        const dept = input.department;
        items = items.filter((p) => p.category.department === dept);
      }
      if (input.ageMonths != null) {
        const age = input.ageMonths;
        // Unspecified age means "suits any age" — don't filter those out.
        items = items.filter(
          (p) =>
            (p.ageMinMonths == null || p.ageMinMonths <= age) &&
            (p.ageMaxMonths == null || p.ageMaxMonths >= age),
        );
      }
      return { items, category: null };
    }),

  product: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const product = await db.query.products.findFirst({
      where: eq(products.slug, input.slug),
      with: { category: true },
    });
    if (!product || !product.isActive) return { product: null, related: [] };
    const related = await db.query.products.findMany({
      where: and(eq(products.isActive, true), eq(products.categoryId, product.categoryId)),
      with: { category: true },
      limit: 5,
    });
    return { product, related: related.filter((r) => r.id !== product.id).slice(0, 4) };
  }),

  subscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.query.newsletterSubscribers.findFirst({
        where: eq(newsletterSubscribers.email, input.email),
      });
      if (existing) return { ok: true, already: true };
      await db.insert(newsletterSubscribers).values({ email: input.email });
      return { ok: true, already: false };
    }),

  checkout: publicQuery
    .input(
      z.object({
        customerName: z.string().min(2, "Please enter your full name"),
        phone: z.string().min(6, "Please enter a valid phone number"),
        address: z.string().min(5, "Please enter a delivery address"),
        note: z.string().optional(),
        items: z
          .array(z.object({ productId: z.number(), qty: z.number().int().min(1).max(20) }))
          .min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const orderItems: OrderItem[] = [];
      let total = 0;

      for (const item of input.items) {
        const p = await db.query.products.findFirst({ where: eq(products.id, item.productId) });
        if (!p || !p.isActive) throw new Error("A product in your cart is no longer available");
        if (p.stock < item.qty) throw new Error(`Only ${p.stock} left of “${p.name}”`);
        orderItems.push({ productId: p.id, name: p.name, price: p.price, qty: item.qty, image: p.image });
        total += p.price * item.qty;
      }

      const [{ id }] = await db
        .insert(orders)
        .values({
          customerName: input.customerName,
          phone: input.phone,
          address: input.address,
          note: input.note ?? null,
          items: orderItems,
          total,
        })
        .$returningId();

      // Decrement stock
      for (const item of input.items) {
        const p = await db.query.products.findFirst({ where: eq(products.id, item.productId) });
        if (p) await db.update(products).set({ stock: p.stock - item.qty }).where(eq(products.id, item.productId));
      }

      return { ok: true, orderId: id, total };
    }),
});

function sortToOrder(sort: "newest" | "price-asc" | "price-desc" | "name") {
  switch (sort) {
    case "price-asc":
      return asc(products.price);
    case "price-desc":
      return desc(products.price);
    case "name":
      return asc(products.name);
    default:
      return desc(products.createdAt);
  }
}
