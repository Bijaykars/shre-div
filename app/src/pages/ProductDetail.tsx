import { useState } from "react";
import { Link, useParams } from "react-router";
import { Minus, Plus } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/lib/cart";
import { formatAge, formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/store/ProductCard";
import { SectionHead } from "@/components/store/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.store.product.useQuery({ slug: slug ?? "" });
  const { add } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-2 md:px-10">
        <Skeleton className="aspect-[4/5] rounded-none" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-4 w-32 rounded-none" />
          <Skeleton className="h-12 w-3/4 rounded-none" />
          <Skeleton className="h-6 w-24 rounded-none" />
          <Skeleton className="h-32 w-full rounded-none" />
        </div>
      </div>
    );
  }

  const product = data?.product;
  if (!product) {
    return (
      <div className="mx-auto max-w-[1440px] px-5 py-32 text-center md:px-10">
        <p className="font-display text-4xl italic text-ink">This piece has found its home</p>
        <p className="mt-3 text-sm text-ink-faint">
          It's no longer available — but the collection is full of beautiful things.
        </p>
        <Link to="/shop" className="btn-sharp mt-8">
          Back to the Shop
        </Link>
      </div>
    );
  }

  const soldOut = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 py-6 text-[10px] uppercase tracking-[0.22em] text-ink-faint">
        <Link to="/" className="hover:text-rose">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-rose">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category.slug}`} className="hover:text-rose">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="relative overflow-hidden bg-rose-pale">
          <div className="aspect-[4/5]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-display text-3xl italic text-rose/40">
                Shré~Div
              </div>
            )}
          </div>
          {product.badge && (
            <span className="absolute left-0 top-5 bg-ink px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-gold-soft">
              {product.badge === "new" ? "New In" : product.badge === "bestseller" ? "Bestseller" : "Limited"}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-6">
          <p className="eyebrow">
            {product.brand ? `${product.brand} · ${product.category.name}` : product.category.name}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.05] text-ink md:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-rose">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-ink-faint line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {(() => {
            const age = formatAge(product.ageMinMonths, product.ageMaxMonths);
            const sizes = product.sizes?.split(",").map((x) => x.trim()).filter(Boolean) ?? [];
            if (!age && !sizes.length) return null;
            return (
              <div className="mt-6 space-y-4">
                {age && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">Suitable for</span>
                    <span className="text-sm font-medium text-ink">{age}</span>
                  </div>
                )}
                {sizes.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">Sizes</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {sizes.map((sz) => (
                        <li key={sz} className="border border-ink/20 px-3 py-1.5 text-xs text-ink">
                          {sz}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}

          {product.description && (
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          {/* Stock note */}
          <p className="mt-5 text-[11px] uppercase tracking-[0.22em]">
            {soldOut ? (
              <span className="text-rose">Sold out — made-to-order on request</span>
            ) : lowStock ? (
              <span className="text-gold-deep">Only {product.stock} left in this batch</span>
            ) : (
              <span className="text-ink-faint">In stock, ready to ship</span>
            )}
          </p>

          {/* Qty + CTA */}
          <div className="mt-8 flex flex-wrap items-stretch gap-4">
            <div className="flex items-center border border-ink/20">
              <button
                className="px-4 py-3 text-ink hover:text-rose disabled:opacity-30"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center font-medium">{qty}</span>
              <button
                className="px-4 py-3 text-ink hover:text-rose"
                onClick={() => setQty((q) => Math.min(q + 1, Math.max(product.stock, 1), 20))}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <button
              disabled={soldOut}
              onClick={() =>
                add(
                  {
                    productId: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  },
                  qty,
                )
              }
              className="btn-sharp flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? "Sold Out" : "Add to Bag"}
            </button>
          </div>

          {/* Details */}
          {product.details && (
            <div className="mt-10 border-t border-ink/10 pt-8">
              <p className="eyebrow !text-ink-faint">Details & Care</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
                {product.details}
              </p>
            </div>
          )}

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/10 pt-8 text-center">
            {[
              ["Cash on", "Delivery"],
              ["Gift wrap", "on request"],
              ["Ships across", "Nepal & beyond"],
            ].map(([a, b]) => (
              <div key={a} className="text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {a}
                <br />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      {data && data.related.length > 0 && (
        <div className="mt-24">
          <SectionHead eyebrow="Complete the look" title="You may also" italic="adore" />
          <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {data.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
