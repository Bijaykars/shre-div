import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatDate } from "@/lib/format";
import { PageHead } from "./fields";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminSubscribers() {
  const utils = trpc.useUtils();
  const { data: subscribers, isLoading } = trpc.admin.subscribers.list.useQuery();

  const remove = trpc.admin.subscribers.remove.useMutation({
    onSuccess: () => {
      toast.success("Subscriber removed");
      utils.admin.subscribers.list.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <PageHead title="Subscribers" sub="The Shré~Div list — early access to new drops" />

      <div className="max-w-2xl border border-ink/10 bg-cream">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-none" />)}
          </div>
        ) : subscribers?.length ? (
          <ul className="divide-y divide-ink/8">
            {subscribers.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{s.email}</p>
                  <p className="text-xs text-ink-faint">Joined {formatDate(s.createdAt)}</p>
                </div>
                <button onClick={() => remove.mutate({ id: s.id })} className="p-2 text-ink-soft hover:text-rose" aria-label="Remove">
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-12 text-center font-display text-xl italic text-ink-faint">
            No one on the list yet.
          </p>
        )}
      </div>
    </div>
  );
}
