import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { DEPARTMENT_LABELS } from "@/lib/format";
import { ImageField, PageHead, SelectField, SwitchField, TextArea, TextField } from "./fields";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminCategory } from "@/lib/types";

type FormState = {
  name: string; slug: string; tagline: string; description: string;
  image: string; department: string; sortOrder: string; isActive: boolean;
};
const emptyForm: FormState = {
  name: "", slug: "", tagline: "", description: "", image: "", department: "clothing", sortOrder: "0", isActive: true,
};

export default function AdminCategories() {
  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.admin.categories.list.useQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const invalidate = () => {
    utils.admin.categories.list.invalidate();
    utils.admin.stats.invalidate();
    utils.store.categories.invalidate();
    utils.store.home.invalidate();
  };

  const create = trpc.admin.categories.create.useMutation({
    onSuccess: () => { toast.success("Category created"); closeDialog(); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const update = trpc.admin.categories.update.useMutation({
    onSuccess: () => { toast.success("Category updated"); closeDialog(); invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const remove = trpc.admin.categories.remove.useMutation({
    onSuccess: () => { toast.success("Category deleted"); setDeleting(null); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setForm({
      name: c.name, slug: c.slug, tagline: c.tagline ?? "", description: c.description ?? "",
      image: c.image ?? "", department: c.department, sortOrder: String(c.sortOrder), isActive: c.isActive,
    });
    setDialogOpen(true);
  };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      tagline: form.tagline || null,
      description: form.description || null,
      image: form.image || null,
      department: form.department as "clothing" | "toys" | "nursery",
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      isActive: form.isActive,
    };
    if (editing) update.mutate({ id: editing.id, data: payload });
    else create.mutate(payload);
  };
  const saving = create.isPending || update.isPending;

  return (
    <div>
      <PageHead
        title="Categories"
        sub="Collections shown in the shop and homepage index"
        action={<button onClick={openCreate} className="btn-sharp !px-6 !py-2.5"><Plus className="h-4 w-4" /> New Category</button>}
      />

      <div className="overflow-x-auto border border-ink/10 bg-cream">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              <th className="px-5 py-3.5 font-medium">Category</th>
              <th className="px-5 py-3.5 font-medium">Department</th>
              <th className="px-5 py-3.5 font-medium">Products</th>
              <th className="px-5 py-3.5 font-medium">Order</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/8">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><Skeleton className="h-10 rounded-none" /></td></tr>
              ))
            ) : categories?.map((c) => (
              <tr key={c.id} className="transition-colors hover:bg-rose-pale/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-10 shrink-0 overflow-hidden bg-rose-pale">
                      {c.image && <img src={c.image} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-xs text-ink-faint">{c.tagline}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-ink-soft">
                  {DEPARTMENT_LABELS[c.department] ?? c.department}
                </td>
                <td className="px-5 py-3">{c.products.length}</td>
                <td className="px-5 py-3">{c.sortOrder}</td>
                <td className="px-5 py-3">
                  <span className={c.isActive ? "bg-[#E2EFDA] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#3E6B2F]" : "bg-ink/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink-faint"}>
                    {c.isActive ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="p-2 text-ink-soft hover:text-rose" aria-label="Edit"><Pencil className="h-4 w-4" strokeWidth={1.5} /></button>
                    <button onClick={() => setDeleting(c)} className="p-2 text-ink-soft hover:text-rose" aria-label="Delete"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-none bg-ivory">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-medium text-ink">
              {editing ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="mt-2 grid grid-cols-2 gap-4">
            <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required className="col-span-2" />
            <TextField label="Slug (optional)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} className="col-span-2" />
            <TextField label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} className="col-span-2" />
            <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} className="col-span-2" />
            <SelectField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })}
              options={[
                { value: "clothing", label: "Clothing" },
                { value: "toys", label: "Toys & Games" },
                { value: "nursery", label: "Nursery & Gear" },
              ]} />
            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(v) => setForm({ ...form, sortOrder: v })} />
            <ImageField label="Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} className="col-span-2" />
            <SwitchField label="Live on store" checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} className="col-span-2" />
            <div className="col-span-2 flex justify-end gap-3 border-t border-ink/10 pt-4">
              <button type="button" onClick={closeDialog} className="btn-sharp-ghost !px-6 !py-2.5">Cancel</button>
              <button type="submit" disabled={saving} className="btn-sharp !px-6 !py-2.5 disabled:opacity-50">
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent className="rounded-none bg-ivory">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl">Delete “{deleting?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Only possible when the category has no products assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate({ id: deleting.id })} className="rounded-none bg-rose hover:bg-rose-deep">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
