import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../api/router";

export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type HomeData = RouterOutputs["store"]["home"];
export type HomeProduct = HomeData["featured"][number];
export type StoreProduct = RouterOutputs["store"]["products"]["items"][number];
export type StoreCategory = RouterOutputs["store"]["categories"][number];
export type ProductDetailResult = RouterOutputs["store"]["product"];
export type SettingsMap = Record<string, string>;

export type AdminProduct = RouterOutputs["admin"]["products"]["list"][number];
export type AdminCategory = RouterOutputs["admin"]["categories"]["list"][number];
export type AdminSlide = RouterOutputs["admin"]["slides"]["list"][number];
export type AdminTestimonial = RouterOutputs["admin"]["testimonials"]["list"][number];
export type AdminOrder = RouterOutputs["admin"]["orders"]["list"][number];
export type AdminSubscriber = RouterOutputs["admin"]["subscribers"]["list"][number];
