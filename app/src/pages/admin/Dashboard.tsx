import { Link } from "react-router";
import { ArrowRight, Mail, Package, ShoppingBag, Tags } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { formatPrice, formatDate } from "@/lib/format";
import { PageHead, StatusChip } from "./fields";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data, isLoading } = trpc.admin.stats.useQuery();

  const stats = [
    { label: "Products", value: data?.productCount, icon: Package, to: "/admin/products" },
    { label: "Orders", value: data?.orderCount, icon: ShoppingBag, to: "/admin/orders" },
    { label: "New Orders", value: data?.newOrders, icon: ShoppingBag, to: "/admin/orders", accent: true },
    { label: "Categories", value: data?.catCount, icon: Tags, to: "/admin/categories" },
    { label: "Subscribers", value: data?.subCount, icon: Mail, to: "/admin/subscribers" },
  ];

  return (
    <div>
      <PageHead title="Dashboard" sub="The shop at a glance" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className={
              s.accent
                ? "border border-rose bg-rose p-5 text-white transition-colors hover:bg-rose-deep"
                : "border border-ink/10 bg-cream p-5 transition-colors hover:border-rose/40"
            }
          >
            <div className="flex items-center justify-between">
              <p className={s.accent ? "text-[10px] uppercase tracking-[0.22em] text-white/80" : "text-[10px] uppercase tracking-[0.22em] text-ink-faint"}>
                {s.label}
              </p>
              <s.icon className="h-4 w-4 opacity-50" strokeWidth={1.5} />
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-9 w-16 rounded-none" />
            ) : (
              <p className="mt-2 font-display text-4xl">{s.value}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="border border-ink/10 bg-cream">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-2xl text-ink">Recent Orders</h2>
            <Link to="/admin/orders" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-rose">
              All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-none" />
              ))}
            </div>
          ) : data?.recentOrders.length ? (
            <ul className="divide-y divide-ink/8">
              {data.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      #SD-{o.id} · {o.customerName}
                    </p>
                    <p className="text-xs text-ink-faint">{formatDate(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{formatPrice(o.total)}</span>
                    <StatusChip status={o.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center font-display text-lg italic text-ink-faint">
              No orders yet — they'll appear here.
            </p>
          )}
        </div>

        {/* Low stock */}
        <div className="border border-ink/10 bg-cream">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-2xl text-ink">Running Low</h2>
            <Link to="/admin/products" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-rose">
              Products <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-none" />
              ))}
            </div>
          ) : data?.lowStock.length ? (
            <ul className="divide-y divide-ink/8">
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="h-11 w-9 shrink-0 overflow-hidden bg-rose-pale">
                    {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.category?.name}</p>
                  </div>
                  <span
                    className={
                      p.stock <= 0
                        ? "bg-rose px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white"
                        : "bg-gold-soft px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-ink"
                    }
                  >
                    {p.stock <= 0 ? "Sold out" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center font-display text-lg italic text-ink-faint">
              Stock levels are healthy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
