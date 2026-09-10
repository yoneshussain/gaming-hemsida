/**
 * GameVault store configuration.
 * Change the store name, currency and delivery fee here — nothing else needs editing.
 */
export const STORE = {
  name: "GameVault",
  tagline: "Your next adventure starts here.",
  currency: "SEK",
  currencySuffix: "kr",
  /** Delivery fee in minor units (öre). 4900 = 49 kr. Charged once per order with physical items. */
  shippingFeeMinor: 4900,
  shippingCountry: "Sweden",
  supportEmail: "support@gamevault.demo",
} as const;

export type PlatformId = "ps5" | "xbox" | "pc";

export const PLATFORMS: {
  id: PlatformId;
  name: string;
  short: string;
  slug: string;
  blurb: string;
}[] = [
  {
    id: "ps5",
    name: "PlayStation 5",
    short: "PS5",
    slug: "playstation-5",
    blurb: "Discs and digital editions for PlayStation 5.",
  },
  {
    id: "xbox",
    name: "Xbox Series X|S",
    short: "Xbox",
    slug: "xbox-series",
    blurb: "Digital for Series X|S, discs for Series X.",
  },
  {
    id: "pc",
    name: "PC",
    short: "PC",
    slug: "pc",
    blurb: "Digital downloads with activation keys.",
  },
];

export const platformBySlug = (slug: string) => PLATFORMS.find((p) => p.slug === slug);
export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id);
