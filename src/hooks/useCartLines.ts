import { useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/lib/catalog";
import { STORE } from "@/config/store";

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotalMinor: number;
}

/** Joins persisted cart SKUs with live product data and computes the (preview) totals. */
export function useCartLines() {
  const { entries } = useCart();
  const { data: products, isLoading, isError } = useProducts();

  return useMemo(() => {
    const bySku = new Map((products ?? []).map((p) => [p.sku, p]));
    const lines: CartLine[] = entries
      .map((e) => {
        const product = bySku.get(e.sku);
        if (!product) return null;
        const quantity = Math.min(e.quantity, product.max_per_order);
        return { product, quantity, lineTotalMinor: product.price_minor * quantity };
      })
      .filter(Boolean) as CartLine[];

    const subtotalMinor = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
    const hasPhysical = lines.some((l) => l.product.format === "physical");
    const shippingMinor = hasPhysical ? STORE.shippingFeeMinor : 0;

    return {
      lines,
      isLoading,
      isError,
      subtotalMinor,
      shippingMinor,
      totalMinor: subtotalMinor + shippingMinor,
      hasPhysical,
      hasDigital: lines.some((l) => l.product.format === "digital"),
      hasUnavailable: lines.some((l) => !l.product.available),
    };
  }, [entries, products, isLoading, isError]);
}
