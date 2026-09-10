import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/** Only SKUs and quantities are persisted — prices always come from the product data. */
export interface CartEntry {
  sku: string;
  quantity: number;
}

const STORAGE_KEY = "gamevault.cart.v1";

function readStorage(): CartEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e.sku === "string" && Number.isFinite(e.quantity))
      .map((e) => ({ sku: e.sku as string, quantity: Math.max(1, Math.floor(e.quantity)) }));
  } catch {
    return [];
  }
}

interface CartContextValue {
  entries: CartEntry[];
  totalQuantity: number;
  addItem: (sku: string, quantity?: number, max?: number) => void;
  setQuantity: (sku: string, quantity: number, max?: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  quantityOf: (sku: string) => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<CartEntry[]>(() => readStorage());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* storage unavailable — cart still works for this session */
    }
  }, [entries]);

  const value = useMemo<CartContextValue>(() => {
    const clamp = (n: number, max = 10) => Math.min(Math.max(1, Math.floor(n)), Math.max(1, max));

    return {
      entries,
      totalQuantity: entries.reduce((sum, e) => sum + e.quantity, 0),
      quantityOf: (sku) => entries.find((e) => e.sku === sku)?.quantity ?? 0,
      addItem: (sku, quantity = 1, max = 10) =>
        setEntries((prev) => {
          const existing = prev.find((e) => e.sku === sku);
          if (existing) {
            return prev.map((e) =>
              e.sku === sku ? { ...e, quantity: clamp(e.quantity + quantity, max) } : e,
            );
          }
          return [...prev, { sku, quantity: clamp(quantity, max) }];
        }),
      setQuantity: (sku, quantity, max = 10) =>
        setEntries((prev) =>
          quantity < 1
            ? prev.filter((e) => e.sku !== sku)
            : prev.map((e) => (e.sku === sku ? { ...e, quantity: clamp(quantity, max) } : e)),
        ),
      removeItem: (sku) => setEntries((prev) => prev.filter((e) => e.sku !== sku)),
      clearCart: () => setEntries([]),
    };
  }, [entries]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
