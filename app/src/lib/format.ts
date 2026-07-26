export function formatPrice(n: number): string {
  return "Rs. " + n.toLocaleString("en-US");
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const DEPARTMENT_LABELS: Record<string, string> = {
  clothing: "Clothing",
  toys: "Toys & Games",
  nursery: "Nursery & Gear",
};

/** Renders a month range the way parents read it: "0–6 months", "3–5 years", "3 years+". */
export function formatAge(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;

  const unit = (m: number) => (m < 24 ? "month" : "year");
  const value = (m: number) => (m < 24 ? m : Math.round((m / 12) * 10) / 10);
  const plural = (m: number) => (value(m) === 1 ? unit(m) : `${unit(m)}s`);

  if (min != null && max != null) {
    // Same unit on both sides reads better: "0–6 months", not "0 months–6 months".
    return unit(min) === unit(max)
      ? `${value(min)}–${value(max)} ${plural(max)}`
      : `${value(min)} ${plural(min)} – ${value(max)} ${plural(max)}`;
  }
  if (min != null) return `${value(min)} ${plural(min)}+`;
  return `Up to ${value(max!)} ${plural(max!)}`;
}
