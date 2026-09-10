import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CoverImage } from "./CoverImage";
import { PlatformBadge, FormatBadge } from "./Badges";
import { Product, formatPrice } from "@/lib/catalog";
import { useCart } from "@/contexts/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="surface-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-primary/40 motion-safe:hover:-translate-y-1">
      <Link to={`/product/${product.sku}`} className="block" tabIndex={-1} aria-hidden="true">
        <CoverImage imageKey={product.image_key} title={product.title} className="rounded-none" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          <PlatformBadge platform={product.platform} />
          <FormatBadge format={product.format} />
        </div>

        <h3 className="text-base font-semibold leading-snug">
          <Link to={`/product/${product.sku}`} className="transition-colors hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <p className="text-xs text-muted-foreground">{product.genre}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price_minor)}</span>
          {product.available ? (
            <Button
              size="sm"
              onClick={() => {
                addItem(product.sku, 1, product.max_per_order);
                toast.success("Added to cart", { description: `${product.title} — ${product.sku}` });
              }}
            >
              Add to Cart
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              Sold out
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
