import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatPrice } from "@/lib/format";
import { ImageField, PageHead, SelectField, SwitchField, TextArea, TextField } from "./fields";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AdminProduct } from "@/lib/types";

type FormState = {
  name: string;
  slug: string;
  description: string;
  details: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  image: string;
  hoverImage: string;
  badge: string;
  ageMinMonths: string;
  ageMaxMonths: string;
  sizes: string;
  brand: string;
  stock: string;
  isFeatured: boolean;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "", slug: "", description: "", details: "", price: "", compareAtPrice: "",
  categoryId: "", image: "", hoverImage: "", badge: "",
  ageMinMonths: "", ageMaxMonths: "", sizes: "", brand: "", stock: "10",
  isFeatured: false, isActive: true,
};

export default function AdminProducts() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.products.list.useQuery();
  const { data: categories } = trpc.admin.categories.list.useQuery();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => {
    utils.admin.products.list.invalidate();
    utils.admin.stats.invalidate();
    utils.store.home.invalidate();
    utils.store.products.invalidate();
  };

  const create = trpc.admin.products.create.useMutation({
    onSuccess: () => { toast.success("Product created"); closeDialog(); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.admin.products.update.useMutation({
    onSuccess: () => { toast.success("Product updated"); closeDialog(); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.admin.products.remove.useMutation({
    onSuccess: () => { toast.success("Product deleted"); setDeleting(null); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories?.[0] ? String(categories[0].id) : "" });
    setDialogOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "", details: p.details ?? "",
      price: String(p.price), compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
      categoryId: String(p.categoryId), image: p.image ?? "", hoverImage: p.hoverImage ?? "",
      badge: p.badge ?? "",
      ageMinMonths: p.ageMinMonths != null ? String(p.ageMinMonths) : "",
      ageMaxMonths: p.ageMaxMonths != null ? String(p.ageMaxMonths) : "",
      sizes: p.sizes ?? "", brand: p.brand ?? "",
      stock: String(p.stock), isFeatured: p.isFeatured, isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description || undefined,
      details: form.details || undefined,
      price: parseInt(form.price, 10) || 0,
      compareAtPrice: form.compareAtPrice ? parseInt(form.compareAtPrice, 10) : null,
      categoryId: parseInt(form.categoryId, 10),
      image: form.image || null,
      hoverImage: form.hoverImage || null,
      badge: (form.badge || null) as "new" | "bestseller" | "limited" | null,
      ageMinMonths: form.ageMinMonths ? parseInt(form.ageMinMonths, 10) : null,
      ageMaxMonths: form.ageMaxMonths ? parseInt(form.ageMaxMonths, 10) : null,
      sizes: form.sizes.trim() || null,
      brand: form.brand.trim() || null,
      stock: parseInt(form.stock, 10) || 0,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <PageHead
        title="Products"
        sub={`${products?.length ?? 0} pieces in the catalogue`}
        action={
          <button onClick={openCreate} className="btn-sharp !px-6 !py-2.5">
            <Plus className="h-4 w-4" /> New Product
          </button>
        }
      />

      <div className="overflow-x-auto border border-ink/10 bg-cream">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              <th className="px-5 py-3.5 font-medium">Product</th>
              <th className="px-5 py-3.5 font-medium">Collection</th>
              <th className="px-5 py-3.5 font-medium">Price</th>
              <th className="px-5 py-3.5 font-medium">Stock</th>
              <th className="px-5 py-3.5 font-medium">Badge</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-3"><Skeleton className="h-10 rounded-none" /></td></tr>
              ))
            ) : products?.length ? (
              products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-rose-pale/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 shrink-0 overflow-hidden bg-rose-pale">
                        {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-ink-faint">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{p.category?.name}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    {p.compareAtPrice ? (
                      <span className="ml-2 text-xs text-ink-faint line-through">{formatPrice(p.compareAtPrice)}</span>
                    ) : null}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn(p.stock <= 5 && "font-semibold text-rose")}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-3">
                    {p.badge ? (
                      <span className="bg-gold-soft px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink">{p.badge}</span>
                    ) : (
                      <span className="text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn(
                      "px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em]",
                      p.isActive ? "bg-[#E2EFDA] text-[#3E6B2F]" : "bg-ink/10 text-ink-faint",
                    )}>
                      {p.isActive ? "Live" : "Hidden"}
                    </span>
                    {p.isFeatured && (
                      <span className="ml-1.5 bg-rose-soft px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-rose-deep">Featured</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-ink-soft hover:text-rose" aria-label="Edit">
                        <Pencil className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                      <button onClick={() => setDeleting(p)} className="p-2 text-ink-soft hover:text-rose" aria-label="Delete">
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-5 py-12 text-center font-display text-lg italic text-ink-faint">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none bg-ivory">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium text-ink">
              {editing ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="mt-2 grid grid-cols-2 gap-4">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required className="col-span-2" />
            <TextField label="Slug (optional — auto from name)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} className="col-span-2" />
            <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} className="col-span-2" />
            <TextArea label="Details & care" value={form.details} onChange={(v) => setForm({ ...form, details: v })} rows={2} className="col-span-2" />
            <TextField label="Price (Rs.)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
            <TextField label="Compare-at price (Rs.)" type="number" value={form.compareAtPrice} onChange={(v) => setForm({ ...form, compareAtPrice: v })} />
            <SelectField
              label="Collection"
              value={form.categoryId}
              onChange={(v) => setForm({ ...form, categoryId: v })}
              options={(categories ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            />
            <SelectField
              label="Badge"
              value={form.badge}
              onChange={(v) => setForm({ ...form, badge: v })}
              options={[
                { value: "", label: "None" },
                { value: "new", label: "New" },
                { value: "bestseller", label: "Bestseller" },
                { value: "limited", label: "Limited" },
              ]}
            />
            <TextField label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} required />
            <div className="flex flex-col gap-2">
              <SwitchField label="Featured" checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-ink/10 pt-4">
              <TextField label="Age from (months)" type="number" value={form.ageMinMonths} onChange={(v) => setForm({ ...form, ageMinMonths: v })} placeholder="0" />
              <TextField label="Age to (months)" type="number" value={form.ageMaxMonths} onChange={(v) => setForm({ ...form, ageMaxMonths: v })} placeholder="Leave blank for no upper limit" />
              <p className="col-span-2 -mt-2 text-xs text-ink-faint">
                Months on both sides — 12 = 1 year, 36 = 3 years. Used by the age filter on the shop page. Leave both blank if it suits any age.
              </p>
              <TextField label="Sizes (clothing only)" value={form.sizes} onChange={(v) => setForm({ ...form, sizes: v })} placeholder="0-3M, 3-6M, 1-2Y" />
              <TextField label="Brand (optional)" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
            </div>
            <ImageField label="Main image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} className="col-span-2" />
            <ImageField label="Hover image (optional)" value={form.hoverImage} onChange={(v) => setForm({ ...form, hoverImage: v })} className="col-span-2" />
            {form.image && (
              <div className="col-span-2">
                <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">Preview</p>
                <img src={form.image} alt="" className="h-40 w-32 border border-ink/10 object-cover" />
              </div>
            )}
            <SwitchField label="Live on store" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} className="col-span-2" />
            <div className="col-span-2 flex justify-end gap-3 border-t border-ink/10 pt-4">
              <button type="button" onClick={closeDialog} className="btn-sharp-ghost !px-6 !py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-sharp !px-6 !py-2.5 disabled:opacity-50">
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent className="rounded-none bg-ivory">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the product from the store permanently. Past orders keep their records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate({ id: deleting.id })}
              className="rounded-none bg-rose hover:bg-rose-deep"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
