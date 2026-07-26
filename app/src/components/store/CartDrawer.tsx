import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { trpc } from "@/providers/trpc";

export function CartDrawer() {
  const { items, total, isOpen, setOpen, setQty, remove, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [orderId, setOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", note: "" });

  const checkout = trpc.store.checkout.useMutation({
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setStep("done");
      clear();
    },
    onError: (err) => toast.error(err.message),
  });

  const close = (open: boolean) => {
    setOpen(open);
    if (!open && step === "done") setStep("cart");
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    checkout.mutate({
      ...form,
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent className="flex w-full flex-col bg-cream p-0 sm:max-w-md">
        <SheetHeader className="border-b border-ink/10 px-6 py-5">
          <SheetTitle className="flex items-center justify-between font-display text-2xl font-medium text-ink">
            {step === "done" ? "Order Placed" : step === "checkout" ? "Delivery Details" : "Your Bag"}
            {step === "cart" && items.length > 0 && (
              <span className="text-[10px] font-sans font-medium uppercase tracking-[0.25em] text-ink-faint">
                {items.length} {items.length === 1 ? "piece" : "pieces"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* ------------------------------- Cart ------------------------------- */}
        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="font-display text-2xl italic text-ink-faint">Your bag is empty</p>
                  <p className="mt-2 text-sm text-ink-faint">
                    Beautiful things are waiting in the collection.
                  </p>
                  <Link to="/shop" onClick={() => setOpen(false)} className="btn-sharp mt-8">
                    Explore the Shop
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 py-5">
                      <div className="h-24 w-20 shrink-0 overflow-hidden bg-rose-pale">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-display text-lg leading-tight text-ink hover:text-rose"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => remove(item.productId)}
                            className="p-1 text-ink-faint hover:text-rose"
                            aria-label="Remove"
                          >
                            <X className="h-4 w-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="mt-1 text-sm text-ink-faint">{formatPrice(item.price)}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center border border-ink/15">
                            <button
                              className="px-2.5 py-1.5 text-ink hover:text-rose"
                              onClick={() => setQty(item.productId, item.qty - 1)}
                              aria-label="Decrease"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-sm">{item.qty}</span>
                            <button
                              className="px-2.5 py-1.5 text-ink hover:text-rose"
                              onClick={() => setQty(item.productId, item.qty + 1)}
                              aria-label="Increase"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-sm font-medium text-ink">
                            {formatPrice(item.price * item.qty)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-ink/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-ink-faint">Subtotal</span>
                  <span className="font-display text-2xl text-ink">{formatPrice(total)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  Cash on delivery · Delivery confirmed by phone after ordering
                </p>
                <button onClick={() => setStep("checkout")} className="btn-sharp mt-4 w-full">
                  Continue to Delivery
                </button>
              </div>
            )}
          </>
        )}

        {/* ----------------------------- Checkout ----------------------------- */}
        {step === "checkout" && (
          <form onSubmit={placeOrder} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
            <button
              type="button"
              onClick={() => setStep("cart")}
              className="mb-5 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-ink-faint hover:text-rose"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to bag
            </button>
            <div className="space-y-4">
              <Field
                label="Full name"
                value={form.customerName}
                onChange={(v) => setForm({ ...form, customerName: v })}
                required
              />
              <Field
                label="Phone"
                value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })}
                placeholder="98XXXXXXXX"
                required
              />
              <div>
                <label className="eyebrow mb-1.5 block !text-ink-faint">Delivery address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  rows={2}
                  className="w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
                />
              </div>
              <div>
                <label className="eyebrow mb-1.5 block !text-ink-faint">Note (optional)</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows={2}
                  placeholder="Size preference, gift wrapping…"
                  className="w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
                />
              </div>
            </div>
            <div className="mt-auto pt-6">
              <div className="mb-4 flex items-center justify-between border-t border-ink/10 pt-4">
                <span className="text-[11px] uppercase tracking-[0.25em] text-ink-faint">Total</span>
                <span className="font-display text-2xl text-ink">{formatPrice(total)}</span>
              </div>
              <button type="submit" disabled={checkout.isPending} className="btn-sharp w-full disabled:opacity-50">
                {checkout.isPending ? "Placing order…" : "Place Order · Cash on Delivery"}
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------ Success ----------------------------- */}
        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-rose" strokeWidth={1.2} />
            <p className="mt-5 font-display text-3xl text-ink">Thank you</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Your order <span className="font-semibold text-rose">#SD-{orderId}</span> is with our
              shop. We will call you shortly to confirm delivery details.
            </p>
            <Link to="/shop" onClick={() => close(false)} className="btn-sharp-ghost mt-8">
              Continue Shopping
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="eyebrow mb-1.5 block !text-ink-faint">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
      />
    </div>
  );
}
