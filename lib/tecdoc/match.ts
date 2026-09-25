// Links TecDoc articles to our own catalogue so matched parts show price/stock.
import type { Product } from "../../data/products";
import type { TecdocArticle } from "./types";

const key = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, "");

const sameBrand = (brand: string, supplier: string) => {
  const a = key(brand);
  const b = key(supplier);
  return !!a && !!b && (a === b || a.includes(b) || b.includes(a));
};

/** Same article = same part number from the same brand. */
export function matchProduct(article: TecdocArticle, products: Product[]): Product | null {
  const articleNo = key(article.articleNo);
  return (
    products.find(
      (p) => key(p.partNumber) === articleNo && sameBrand(p.brand, article.supplierName),
    ) ?? null
  );
}
