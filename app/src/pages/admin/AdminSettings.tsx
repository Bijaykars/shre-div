import { useEffect, useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { ImageField, PageHead, TextArea, TextField } from "./fields";
import { Skeleton } from "@/components/ui/skeleton";

type Field = { key: string; label: string; area?: boolean; image?: boolean; rows?: number; hint?: string };

const GROUPS: { title: string; fields: Field[] }[] = [
  {
    title: "Store chrome",
    fields: [
      { key: "announcement", label: "Announcement bar", hint: "Shown in the dark bar at the very top of the store" },
      { key: "marquee", label: "Marquee strip", area: true, hint: "Separate phrases with | — they scroll across the rose band" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "address", label: "Shop address", hint: "Shown in the footer and on the map banner" },
      { key: "mapQuery", label: "Map search term (optional)", hint: "Only if the address alone drops the pin in the wrong place — try a landmark or plus code" },
      { key: "hours", label: "Opening hours" },
      { key: "instagram", label: "Instagram handle" },
    ],
  },
  {
    title: "Homepage — the three gateway cards",
    fields: [
      { key: "gateway1Title", label: "Card 1 — title" },
      { key: "gateway1Sub", label: "Card 1 — subtitle" },
      { key: "gateway1Link", label: "Card 1 — link", hint: "e.g. /shop?department=clothing" },
      { key: "gateway1Image", label: "Card 1 — image", image: true },
      { key: "gateway2Title", label: "Card 2 — title" },
      { key: "gateway2Sub", label: "Card 2 — subtitle" },
      { key: "gateway2Link", label: "Card 2 — link" },
      { key: "gateway2Image", label: "Card 2 — image", image: true },
      { key: "gateway3Title", label: "Card 3 — title" },
      { key: "gateway3Sub", label: "Card 3 — subtitle" },
      { key: "gateway3Link", label: "Card 3 — link" },
      { key: "gateway3Image", label: "Card 3 — image", image: true },
    ],
  },
  {
    title: "Homepage — copy",
    fields: [
      { key: "bestsellersNote", label: "Bestsellers note", area: true, hint: "The small paragraph beside “The bestsellers”" },
      { key: "newsletterTitle", label: "Newsletter heading" },
      { key: "newsletterBody", label: "Newsletter blurb", area: true },
    ],
  },
  {
    title: "About page",
    fields: [
      { key: "aboutTitle", label: "Title" },
      { key: "aboutBody", label: "Story", area: true, rows: 6, hint: "Blank line starts a new paragraph" },
      { key: "aboutImage", label: "Image", image: true },
    ],
  },
];

export default function AdminSettings() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.settings.all.useQuery();
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const save = trpc.admin.settings.set.useMutation({
    onSuccess: () => {
      toast.success("Settings saved — live on the store");
      utils.admin.settings.all.invalidate();
      utils.store.settings.invalidate();
      utils.store.home.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (key: string, v: string) => setForm((f) => ({ ...f, [key]: v }));

  return (
    <div className="max-w-3xl">
      <PageHead title="Settings" sub="Store copy and contact details — every change goes live immediately" />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-none" />)}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate({ entries: form });
          }}
          className="space-y-10"
        >
          {GROUPS.map((g) => (
            <section key={g.title} className="space-y-5">
              <h2 className="border-b border-ink/10 pb-2 font-display text-2xl text-ink">{g.title}</h2>
              {g.fields.map((f) => (
                <div key={f.key}>
                  {f.image ? (
                    <ImageField label={f.label} value={form[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
                  ) : f.area ? (
                    <TextArea label={f.label} value={form[f.key] ?? ""} onChange={(v) => set(f.key, v)} rows={f.rows ?? 2} />
                  ) : (
                    <TextField label={f.label} value={form[f.key] ?? ""} onChange={(v) => set(f.key, v)} />
                  )}
                  {f.hint && <p className="mt-1 text-xs text-ink-faint">{f.hint}</p>}
                </div>
              ))}
            </section>
          ))}

          <div className="sticky bottom-0 flex justify-end border-t border-ink/10 bg-ivory py-5">
            <button type="submit" disabled={save.isPending} className="btn-sharp !px-8 !py-3 disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
