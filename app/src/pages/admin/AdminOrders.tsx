import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatDate, formatPrice } from "@/lib/format";
import { PageHead, StatusChip } from "./fields";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminOrder } from "@/lib/types";

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image?: string | null;
};

const STATUSES = ["new", "confirmed", "delivered", "cancelled"] as const;

export default function AdminOrders() {
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.admin.orders.list.useQuery();
  const [expanded, setExpanded] = useState<number | null>(null);

  const setStatus = trpc.admin.orders.setStatus.useMutation({
    onSuccess: () => {
      toast.success("Order updated");
      utils.admin.orders.list.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHead title="Orders" sub={`${orders?.length ?? 0} orders, newest first`} />

      <div className="border border-ink/10 bg-cream">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-none" />)}
          </div>
        ) : orders?.length ? (
          <ul className="divide-y divide-ink/8">
            {orders.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                expanded={expanded === o.id}
                onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
                onStatus={(status) => setStatus.mutate({ id: o.id, status })}
              />
            ))}
          </ul>
        ) : (
          <p className="p-12 text-center font-display text-xl italic text-ink-faint">
            No orders yet — share the store and they'll come.
          </p>
        )}
      </div>
    </div>
  );
}

function OrderRow({
  order: o,
  expanded,
  onToggle,
  onStatus,
}: {
  order: AdminOrder;
  expanded: boolean;
  onToggle: () => void;
  onStatus: (s: (typeof STATUSES)[number]) => void;
}) {
  const items = (o.items ?? []) as OrderItem[];
  return (
    <li>
      <button onClick={onToggle} className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-rose-pale/40">
        <div className="min-w-[90px]">
          <p className="font-display text-lg text-ink">#SD-{o.id}</p>
          <p className="text-xs text-ink-faint">{formatDate(o.createdAt)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{o.customerName}</p>
          <p className="truncate text-xs text-ink-faint">{o.phone} · {o.address}</p>
        </div>
        <p className="text-sm text-ink-faint">{items.reduce((s, i) => s + i.qty, 0)} items</p>
        <p className="w-24 text-right font-medium text-ink">{formatPrice(o.total)}</p>
        <StatusChip status={o.status} />
        {expanded ? <ChevronUp className="h-4 w-4 text-ink-faint" /> : <ChevronDown className="h-4 w-4 text-ink-faint" />}
      </button>

      {expanded && (
        <div className="border-t border-ink/8 bg-ivory px-5 py-5">
          <div className="grid gap-6 md:grid-cols-[1fr_260px]">
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">Items</p>
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-rose-pale">
                      {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{item.name}</p>
                      <p className="text-xs text-ink-faint">{formatPrice(item.price)} × {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(item.price * item.qty)}</p>
                  </li>
                ))}
              </ul>
              {o.note && (
                <p className="mt-4 border-l-2 border-gold pl-3 text-sm italic text-ink-soft">“{o.note}”</p>
              )}
            </div>
            <div>
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">Status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatus(s)}
                    disabled={o.status === s}
                    className={
                      o.status === s
                        ? "border border-rose bg-rose px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                        : "border border-ink/15 bg-cream px-3 py-2 text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft hover:border-rose hover:text-rose"
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-faint">
                Call <span className="text-ink">{o.phone}</span> to arrange delivery. Payment is cash on delivery.
              </p>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
