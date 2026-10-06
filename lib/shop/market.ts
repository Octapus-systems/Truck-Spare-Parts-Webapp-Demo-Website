// Display currency for the shop. Prices are stored in AED; other markets are
// display estimates. Orders and invoices are always in AED.
import type { Product } from "@/data/products";
import type { Market } from "@/lib/store/types";

export const MARKETS: Record<Market, { currency: string; locale: string; factor: number; label: string }> = {
  UAE: { currency: "AED", locale: "en-AE", factor: 1, label: "United Arab Emirates" },
  Qatar: { currency: "QAR", locale: "en-QA", factor: 0.99, label: "Qatar" },
  Saudi: { currency: "SAR", locale: "en-SA", factor: 1.02, label: "Saudi Arabia" },
  USD: { currency: "USD", locale: "en-US", factor: 1 / 3.6725, label: "US dollar" },
};

export const money = (aed: number, market: Market) =>
  new Intl.NumberFormat(MARKETS[market].locale, {
    style: "currency",
    currency: MARKETS[market].currency,
    maximumFractionDigits: market === "USD" ? 2 : 0,
  }).format(aed * MARKETS[market].factor);

export const productPrice = (product: Product, market: Market) =>
  product.commercialData === false ? "Price on request" : money(product.price, market);

export type StockState = { label: string; tone: "in" | "low" | "out" };

export function stockState(product: Product): StockState {
  if (product.commercialData === false) return { label: "Check availability", tone: "low" };
  if (product.stock <= 0) return { label: "Out of stock · order in", tone: "out" };
  if (product.stock <= 5) return { label: `Only ${product.stock} left`, tone: "low" };
  return { label: `${product.stock} in stock`, tone: "in" };
}
