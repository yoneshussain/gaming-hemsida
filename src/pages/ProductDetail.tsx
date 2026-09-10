import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CoverImage } from "@/components/store/CoverImage";
import { PlatformBadge, FormatBadge } from "@/components/store/Badges";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/catalog";
import { useCart } from "@/contexts/CartContext";
import { STORE } from "@/config/store";

export default function ProductDetail() {
  const { sku = "" } = useParams();
  const { data: products, isLoading, isError } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = products?.find((p) => p.sku === sku);
  const variants = products?.filter((p) => p.title === product?.title && p.sku !== sku) ?? [];

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (isError || !product) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h1 className="text-2xl font-bold">We couldn’t find that game</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The listing may have been removed, or the link is incorrect.
          </p>
          <Button asChild className="mt-6">
            <Link to="/games">Browse all games</Link>
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const max = product.max_per_order;

  return (
    <StoreLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          to={`/games`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back to catalogue
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-12">
          <CoverImage imageKey={product.image_key} title={product.title} priority className="max-w-md" />

          <div>
            <div className="flex flex-wrap gap-2">
              <PlatformBadge platform={product.platform} />
              <FormatBadge format={product.format} />
              <span className="inline-flex items-center rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                {product.genre}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{product.title}</h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">SKU {product.sku}</p>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="mt-6 space-y-3">
              <div className="surface-card flex gap-3 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold">Compatibility</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{product.compatibility}</p>
                </div>
              </div>
              <div className="surface-card flex gap-3 p-4">
                <Truck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <h2 className="text-sm font-semibold">Delivery</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.format === "physical"
                      ? `Shipped to addresses in ${STORE.shippingCountry}. ${STORE.shippingFeeMinor / 100} ${STORE.currencySuffix} delivery, charged once per order.`
                      : "Digital delivery — no address and no delivery fee."}{" "}
                    This is a demo store: nothing is actually dispatched or activated.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(product.price_minor)}</span>
              <span
                className={`text-sm font-medium ${product.available ? "text-success" : "text-muted-foreground"}`}
              >
                {product.available ? "In stock" : "Currently unavailable"}
              </span>
            </div>

            {product.available ? (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <span className="w-10 text-center text-base font-semibold" aria-live="polite">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((n) => Math.min(max, n + 1))}
                    disabled={quantity >= max}
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className="h-12 flex-1 sm:flex-none sm:px-10"
                  onClick={() => {
                    addItem(product.sku, quantity, max);
                    toast.success("Added to cart", {
                      description: `${quantity} × ${product.title} (${product.sku})`,
                    });
                  }}
                >
                  Add to Cart
                </Button>
              </div>
            ) : (
              <Button size="lg" className="mt-5 h-12" disabled>
                Currently unavailable
              </Button>
            )}
            <p className="mt-3 text-xs text-muted-foreground">Maximum {max} per order.</p>
          </div>
        </div>

        {variants.length > 0 && (
          <section className="mt-16" aria-labelledby="variants-heading">
            <h2 id="variants-heading" className="text-xl font-bold">
              Other editions of {product.title}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {variants.map((v) => (
                <ProductCard key={v.sku} product={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StoreLayout>
  );
}
