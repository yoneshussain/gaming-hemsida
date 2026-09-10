import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { CoverImage } from "@/components/store/CoverImage";
import { PlatformBadge, FormatBadge } from "@/components/store/Badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useCartLines } from "@/hooks/useCartLines";
import { formatPrice } from "@/lib/catalog";
import { STORE } from "@/config/store";

export default function Cart() {
  const { setQuantity, removeItem } = useCart();
  const { lines, isLoading, subtotalMinor, shippingMinor, totalMinor, hasPhysical, hasUnavailable } =
    useCartLines();

  return (
    <StoreLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Your cart</h1>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <div className="surface-card mt-8 flex flex-col items-center gap-3 p-14 text-center">
            <ShoppingBag className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Your cart is empty</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Browse the vault and add a few games — your cart is remembered on this device.
            </p>
            <Button asChild className="mt-2">
              <Link to="/games">Explore Games</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {lines.map(({ product, quantity, lineTotalMinor }) => (
                <li key={product.sku} className="surface-card flex gap-4 p-4">
                  <Link to={`/product/${product.sku}`} className="w-20 shrink-0 sm:w-24">
                    <CoverImage imageKey={product.image_key} title={product.title} />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">
                          <Link to={`/product/${product.sku}`} className="hover:text-primary">
                            {product.title}
                          </Link>
                        </h2>
                        <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
                      </div>
                      <span className="text-base font-bold text-primary">{formatPrice(lineTotalMinor)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <PlatformBadge platform={product.platform} />
                      <FormatBadge format={product.format} />
                    </div>

                    {!product.available && (
                      <p className="text-xs font-medium text-destructive">
                        This edition is currently unavailable — remove it to continue.
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-lg border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          aria-label={`Decrease quantity of ${product.title}`}
                          onClick={() => setQuantity(product.sku, quantity - 1, product.max_per_order)}
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10"
                          aria-label={`Increase quantity of ${product.title}`}
                          disabled={quantity >= product.max_per_order}
                          onClick={() => setQuantity(product.sku, quantity + 1, product.max_per_order)}
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(product.price_minor)} each
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(product.sku)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" aria-hidden="true" /> Remove
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="surface-card h-fit p-5 lg:sticky lg:top-24">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-medium">{formatPrice(subtotalMinor)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-medium">
                    {hasPhysical ? formatPrice(shippingMinor) : "Free (digital only)"}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total</dt>
                  <dd className="font-bold text-primary">{formatPrice(totalMinor)}</dd>
                </div>
              </dl>

              <p className="mt-3 text-xs text-muted-foreground">
                {hasPhysical
                  ? `Delivery within ${STORE.shippingCountry}, charged once per order.`
                  : "Digital orders need no address and carry no delivery fee."}
              </p>

              <Button asChild size="lg" className="mt-5 h-12 w-full" disabled={hasUnavailable}>
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="mt-3 h-11 w-full">
                <Link to="/games">Continue Shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
