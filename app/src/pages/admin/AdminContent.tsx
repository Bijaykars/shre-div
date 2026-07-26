import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { ImageField, PageHead, SwitchField, TextArea, TextField } from "./fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminSlide, AdminTestimonial } from "@/lib/types";

/* ------------------------------- Hero slides ------------------------------ */

type SlideForm = {
  eyebrow: string; title: string; highlight: string; subtitle: string;
  ctaText: string; ctaLink: string; image: string; sortOrder: string; isActive: boolean;
};
const emptySlide: SlideForm = {
  eyebrow: "", title: "", highlight: "", subtitle: "", ctaText: "", ctaLink: "/shop", image: "", sortOrder: "0", isActive: true,
};

function SlidesPanel() {
  const utils = trpc.useUtils();
  const { data: slides, isLoading } = trpc.admin.slides.list.useQuery();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptySlide);

  const invalidate = () => { utils.admin.slides.list.invalidate(); utils.store.home.invalidate(); };
  const create = trpc.admin.slides.create.useMutation({
    onSuccess: () => { toast.success("Slide created"); setOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.admin.slides.update.useMutation({
    onSuccess: () => { toast.success("Slide updated"); setOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.admin.slides.remove.useMutation({
    onSuccess: () => { toast.success("Slide deleted"); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (s: AdminSlide) => {
    setEditing(s);
    setForm({
      eyebrow: s.eyebrow ?? "", title: s.title, highlight: s.highlight ?? "", subtitle: s.subtitle ?? "",
      ctaText: s.ctaText ?? "", ctaLink: s.ctaLink ?? "", image: s.image ?? "",
      sortOrder: String(s.sortOrder), isActive: s.isActive,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      eyebrow: form.eyebrow || null, title: form.title, highlight: form.highlight || null,
      subtitle: form.subtitle || null, ctaText: form.ctaText || null, ctaLink: form.ctaLink || null,
      image: form.image || null, sortOrder: parseInt(form.sortOrder, 10) || 0, isActive: form.isActive,
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={() => { setEditing(null); setForm(emptySlide); setOpen(true); }} className="btn-sharp !px-6 !py-2.5">
          <Plus className="h-4 w-4" /> New Slide
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-none" />)
          : slides?.map((s) => (
              <div key={s.id} className="group relative overflow-hidden border border-ink/10 bg-ink">
                <div className="aspect-[16/8]">
                  {s.image && <img src={s.image} alt="" className="h-full w-full object-cover opacity-80" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.25em] text-gold-soft">{s.eyebrow}</p>
                    <p className="font-display text-xl text-cream">
                      {s.title} <em className="italic text-rose-soft">{s.highlight}</em>
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-cream/60">
                      {s.isActive ? "Live" : "Hidden"} · Order {s.sortOrder}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="bg-cream/10 p-2 text-cream hover:bg-rose" aria-label="Edit"><Pencil className="h-4 w-4" strokeWidth={1.5} /></button>
                    <button onClick={() => remove.mutate({ id: s.id })} className="bg-cream/10 p-2 text-cream hover:bg-rose" aria-label="Delete"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-none bg-ivory">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium text-ink">{editing ? "Edit Slide" : "New Slide"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="mt-2 grid grid-cols-2 gap-4">
            <TextField label="Eyebrow" value={form.eyebrow} onChange={(v) => setForm({ ...form, eyebrow: v })} placeholder="The Festive Edit · 2026" className="col-span-2" />
            <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
            <TextField label="Highlight (italic rose words)" value={form.highlight} onChange={(v) => setForm({ ...form, highlight: v })} />
            <TextArea label="Subtitle" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} rows={2} className="col-span-2" />
            <TextField label="Button text" value={form.ctaText} onChange={(v) => setForm({ ...form, ctaText: v })} />
            <TextField label="Button link" value={form.ctaLink} onChange={(v) => setForm({ ...form, ctaLink: v })} />
            <ImageField label="Slide image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} className="col-span-2" />
            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} />
            <SwitchField label="Live" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} className="self-end" />
            <div className="col-span-2 flex justify-end gap-3 border-t border-ink/10 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="btn-sharp-ghost !px-6 !py-2.5">Cancel</button>
              <button type="submit" className="btn-sharp !px-6 !py-2.5">{editing ? "Save Changes" : "Create Slide"}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

type QuoteForm = { name: string; location: string; quote: string; rating: string; sortOrder: string; isActive: boolean };
const emptyQuote: QuoteForm = { name: "", location: "", quote: "", rating: "5", sortOrder: "0", isActive: true };

function TestimonialsPanel() {
  const utils = trpc.useUtils();
  const { data: quotes, isLoading } = trpc.admin.testimonials.list.useQuery();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [form, setForm] = useState<QuoteForm>(emptyQuote);

  const invalidate = () => { utils.admin.testimonials.list.invalidate(); utils.store.home.invalidate(); };
  const create = trpc.admin.testimonials.create.useMutation({
    onSuccess: () => { toast.success("Testimonial added"); setOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.admin.testimonials.update.useMutation({
    onSuccess: () => { toast.success("Testimonial updated"); setOpen(false); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.admin.testimonials.remove.useMutation({
    onSuccess: () => { toast.success("Testimonial deleted"); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, location: form.location || null, quote: form.quote,
      rating: parseInt(form.rating, 10) || 5, sortOrder: parseInt(form.sortOrder, 10) || 0, isActive: form.isActive,
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={() => { setEditing(null); setForm(emptyQuote); setOpen(true); }} className="btn-sharp !px-6 !py-2.5">
          <Plus className="h-4 w-4" /> New Testimonial
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-none" />)
          : quotes?.map((q) => (
              <div key={q.id} className="border border-ink/10 bg-cream p-5">
                <p className="font-display text-lg italic leading-snug text-ink">“{q.quote}”</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">{q.name}</p>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">
                      {q.location} · {q.isActive ? "Live" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setEditing(q);
                        setForm({ name: q.name, location: q.location ?? "", quote: q.quote, rating: String(q.rating), sortOrder: String(q.sortOrder), isActive: q.isActive });
                        setOpen(true);
                      }}
                      className="p-2 text-ink-soft hover:text-rose" aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                    <button onClick={() => remove.mutate({ id: q.id })} className="p-2 text-ink-soft hover:text-rose" aria-label="Delete">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-none bg-ivory">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium text-ink">{editing ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="mt-2 grid grid-cols-2 gap-4">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <TextField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
            <TextArea label="Quote" value={form.quote} onChange={(v) => setForm({ ...form, quote: v })} rows={4} className="col-span-2" />
            <TextField label="Rating (1–5)" type="number" value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} />
            <SwitchField label="Live" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} className="col-span-2" />
            <div className="col-span-2 flex justify-end gap-3 border-t border-ink/10 pt-4">
              <button type="button" onClick={() => setOpen(false)} className="btn-sharp-ghost !px-6 !py-2.5">Cancel</button>
              <button type="submit" className="btn-sharp !px-6 !py-2.5">{editing ? "Save Changes" : "Add Testimonial"}</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */

export default function AdminContent() {
  return (
    <div>
      <PageHead title="Homepage" sub="Hero slides and testimonials shown on the storefront" />
      <Tabs defaultValue="slides">
        <TabsList className="rounded-none border border-ink/10 bg-cream">
          <TabsTrigger value="slides" className="rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream">Hero Slides</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-none data-[state=active]:bg-ink data-[state=active]:text-cream">Testimonials</TabsTrigger>
        </TabsList>
        <TabsContent value="slides" className="mt-6"><SlidesPanel /></TabsContent>
        <TabsContent value="testimonials" className="mt-6"><TestimonialsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}
