import { STORE, PlatformId } from "@/config/store";

export type ProductFormat = "physical" | "digital";

export interface Product {
  sku: string;
  title: string;
  platform: PlatformId;
  format: ProductFormat;
  genre: string;
  price_minor: number;
  currency: string;
  description: string;
  compatibility: string;
  delivery_note: string;
  image_key: string;
  available: boolean;
  max_per_order: number;
  featured: boolean;
  sort_order: number;
}

/** 79900 -> "799 kr" */
export function formatPrice(minor: number): string {
  const major = minor / 100;
  const text = Number.isInteger(major)
    ? major.toLocaleString("sv-SE")
    : major.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${text} ${STORE.currencySuffix}`;
}

export const formatLabel = (format: ProductFormat) => (format === "physical" ? "Physical disc" : "Digital");
