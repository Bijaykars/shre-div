import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 120 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/* ---------------------------------- Shop ---------------------------------- */

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  tagline: varchar("tagline", { length: 255 }),
  description: text("description"),
  image: text("image"),
  department: mysqlEnum("department", ["clothing", "toys", "nursery"])
    .default("clothing")
    .notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  description: text("description"),
  details: text("details"),
  price: int("price").notNull(), // in NPR (rupees)
  compareAtPrice: int("compareAtPrice"),
  categoryId: bigint("categoryId", { mode: "number", unsigned: true }).notNull(),
  image: text("image"),
  hoverImage: text("hoverImage"),
  badge: mysqlEnum("badge", ["new", "bestseller", "limited"]),
  // Age suitability in months, so "0–6 months" and "3–5 years" use one scale.
  // Null max means open-ended ("3 years+"), typical for toys.
  ageMinMonths: int("ageMinMonths"),
  ageMaxMonths: int("ageMaxMonths"),
  sizes: varchar("sizes", { length: 255 }), // clothing only, comma-separated
  brand: varchar("brand", { length: 120 }), // mostly nursery & gear
  stock: int("stock").default(0).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* --------------------------------- Content -------------------------------- */

export const heroSlides = mysqlTable("hero_slides", {
  id: serial("id").primaryKey(),
  eyebrow: varchar("eyebrow", { length: 200 }),
  title: varchar("title", { length: 255 }).notNull(),
  highlight: varchar("highlight", { length: 160 }),
  subtitle: text("subtitle"),
  ctaText: varchar("ctaText", { length: 80 }),
  ctaLink: varchar("ctaLink", { length: 255 }),
  image: text("image"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export const testimonials = mysqlTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  location: varchar("location", { length: 120 }),
  quote: text("quote").notNull(),
  rating: int("rating").default(5).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export const siteSettings = mysqlTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

/* --------------------------------- Commerce ------------------------------- */

export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  address: text("address").notNull(),
  note: text("note"),
  items: json("items").notNull(), // [{ productId, name, price, qty, image }]
  total: int("total").notNull(),
  status: mysqlEnum("status", ["new", "confirmed", "delivered", "cancelled"])
    .default("new")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/* ---------------------------------- Types --------------------------------- */

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};
