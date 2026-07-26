import { Link } from "react-router";
import { SlideLabel } from "./Motion";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { HomeProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  new: "bg-gold text-ink",
  bestseller: "bg-rose text-white",
  limited: "bg-ink text-gold-soft",
};
const BADGE_LABELS: Record<string, string> = {
  new: "New In",
  bestseller: "Bestseller",
  limited: "Limited",
};

export function ProductCard({ product }: { product: HomeProduct }) {
  const { add } = useCart();
  const soldOut = product.stock <= 0;

  return (
    <div className="group">
      <div className="relative overflow-hidden bg-rose-pale">
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <div className="aspect-[4/5] w-full overflow-hidden">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className={cn(
                  "h-full w-full object-cover transition-[transform,opacity] duration-slow ease-out group-hover:scale-105",
                  product.hoverImage && "group-hover:opacity-0",
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-2xl italic text-rose/40">
                Shré~Div
              </div>
            )}
            {product.hoverImage && (
              <img
                src={product.hoverImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-[transform,opacity] duration-slow ease-out group-hover:scale-105 group-hover:opacity-100"
              />
            )}
          </div>
        </Link>

        {product.badge && (
          <span
            className={cn(
              "absolute left-0 top-4 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em]",
              BADGE_STYLES[product.badge],
            )}
          >
            {BADGE_LABELS[product.badge]}
          </span>
        )}
        {soldOut && (
          <span className="absolute right-0 top-4 bg-cream px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-ink">
            Sold Out
          </span>
        )}

        {/* Add-to-bag reveal */}
        {!soldOut && (
          <button
            onClick={() =>
              add({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
              })
            }
            className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-3 text-[10px] font-medium uppercase tracking-[0.28em] text-cream backdrop-blur transition-transform duration-500 ease-editorial hover:bg-rose group-hover:translate-y-0"
          >
            <SlideLabel>Add to Bag</SlideLabel>
          </button>
        )}
      </div>

      <div className="pt-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint">
          {product.category?.name}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="mt-1 font-display text-xl leading-snug text-ink transition-colors hover:text-rose">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1.5 text-sm text-ink">
          <span className="font-medium">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="ml-2 text-ink-faint line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
