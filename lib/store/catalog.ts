// Live catalogue: seed products with admin overrides and sold stock applied.
// Pure, so shop, counter and tests agree on one stock number.
import type { Product } from "../../data/products";
import type { AppState } from "./types";

export function liveProducts(
  seed: Product[],
  { overrides, movements }: Pick<AppState, "overrides" | "movements">,
): Product[] {
  const moved = new Map<string, number>();
  for (const m of movements) moved.set(m.productId, (moved.get(m.productId) ?? 0) + m.qty);
  return seed.map((product) => {
    const override = overrides[product.id];
    const delta = moved.get(product.id) ?? 0;
    if (!override && !delta) return product;
    return {
      ...product,
      price: override?.price ?? product.price,
      stock: (override?.stockBase ?? product.stock) + delta,
    };
  });
}
