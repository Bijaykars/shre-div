import { useLayoutEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { ProductCard } from "@/components/store/ProductCard";
import { scrollToY } from "@/components/store/Motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Department = "clothing" | "toys" | "nursery" | "all";
type Sort = "newest" | "price-asc" | "price-desc" | "name";

const DEPARTMENT_TABS: { key: Department; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "clothing", label: "Clothing" },
  { key: "toys", label: "Toys & Games" },
  { key: "nursery", label: "Nursery & Gear" },
];

/** Value is the midpoint of each bracket in months — matched against each product's range. */
const AGE_BANDS: { value: string; label: string }[] = [
  { value: "3", label: "0–6 months" },
  { value: "9", label: "6–12 months" },
  { value: "18", label: "1–2 years" },
  { value: "36", label: "2–4 years" },
  { value: "60", label: "4–6 years" },
  { value: "96", label: "6+ years" },
];

const SORTS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "price-asc", label: "Price · low to high" },
  { key: "price-desc", label: "Price · high to low" },
  { key: "name", label: "Alphabetical" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const department = (params.get("department") as Department) ?? "all";
  const categorySlug = params.get("category") ?? undefined;
  const search = params.get("q") ?? undefined;
  const sort = (params.get("sort") as Sort) ?? "newest";
  const age = params.get("age") ?? "";

  const { data: categories } = trpc.store.categories.useQuery();
  const { data, isLoading } = trpc.store.products.useQuery({
    department: department === "all" ? undefined : department,
    ageMonths: age ? Number(age) : undefined,
    categorySlug,
    search,
    sort,
  });

  // Only offer collections belonging to the department in view.
  const visibleCategories =
    department === "all"
      ? categories
      : categories?.filter((c) => c.department === department);

  // Narrowing the results shortens the page; without this the browser clamps the
  // old scroll position and strands you in the footer. Pull the filter bar back
  // to the top instead of jumping to the very top of the page.
  const filterBar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = filterBar.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (window.scrollY > top) scrollToY(top);
  }, [department, categorySlug, search, sort, age]);

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    setParams(next, { preventScrollReset: true });
  };

  const title = search
    ? `“${search}”`
    : (data?.category?.name ??
      DEPARTMENT_TABS.find((t) => t.key === department && t.key !== "all")?.label ??
      "Everything");

  const subtitle = search
    ? "Search results"
    : (data?.category?.tagline ??
      "Clothing, toys and nursery essentials for growing families.");

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
      {/* Page head */}
      <div className="border-b border-ink/10 py-12 md:py-16">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-3 font-display text-5xl leading-[1.02] text-ink md:text-6xl">{title}</h1>
        <p className="mt-3 max-w-lg text-sm text-ink-faint">{subtitle}</p>
      </div>

      {/* Filter bar */}
      <div ref={filterBar} className="flex flex-wrap items-center gap-x-8 gap-y-4 border-b border-ink/10 py-5">
        <div className="flex flex-wrap gap-1">
          {DEPARTMENT_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                // Switching department invalidates the collection chosen under the old one.
                const next = new URLSearchParams(params);
                next.delete("category");
                if (t.key === "all") next.delete("department");
                else next.set("department", t.key);
                setParams(next, { preventScrollReset: true });
              }}
              className={cn(
                "border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors",
                department === t.key
                  ? "border-ink bg-ink text-cream"
                  : "border-ink/15 text-ink-soft hover:border-ink/40",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">Age</label>
          <select
            value={age}
            onChange={(e) => setParam("age", e.target.value || null)}
            className="border border-ink/15 bg-transparent px-3 py-2 text-xs text-ink outline-none focus:border-rose"
          >
            <option value="">Any age</option>
            {AGE_BANDS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">Collection</label>
          <select
            value={categorySlug ?? ""}
            onChange={(e) => setParam("category", e.target.value || null)}
            className="border border-ink/15 bg-transparent px-3 py-2 text-xs text-ink outline-none focus:border-rose"
          >
            <option value="">All collections</option>
            {visibleCategories?.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">
            {isLoading ? "…" : `${data?.items.length ?? 0} items`}
          </span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="border border-ink/15 bg-transparent px-3 py-2 text-xs text-ink outline-none focus:border-rose"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[4/5] w-full rounded-none" />
              <Skeleton className="mt-4 h-5 w-3/4 rounded-none" />
              <Skeleton className="mt-2 h-4 w-1/3 rounded-none" />
            </div>
          ))
        ) : data?.items.length ? (
          data.items.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="font-display text-3xl italic text-ink-faint">Nothing here yet</p>
            <p className="mt-2 text-sm text-ink-faint">
              Try another department or age range — new stock arrives in small batches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
