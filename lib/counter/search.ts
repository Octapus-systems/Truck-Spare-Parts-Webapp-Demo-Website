// Merges own-catalogue matches with TecDoc articles into one result list.
// Pure: no fetching. Own stock comes first; TecDoc articles that are the same
// part as an own item are folded into that item's row.
import type { Product } from "../../data/products";
import { matchProduct } from "../tecdoc/match.ts";
import type { TecdocArticle } from "../tecdoc/types";
import { toFils } from "./billing.ts";
import type { ResultRow } from "./types";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Same fields as the shop search: name, brand, numbers, category, fitment. */
export function searchOwn(query: string, products: Product[]): Product[] {
  const q = normalize(query);
  if (!q) return products;
  return products.filter((p) =>
    [p.name, p.brand, p.partNumber, p.sku, p.category, ...p.oe, ...p.fitment].some((field) =>
      normalize(field).includes(q),
    ),
  );
}

export const ownRow = (product: Product, stock: number): ResultRow => ({
  key: `own:${product.id}`,
  source: "own",
  product,
  article: null,
  brand: product.brand,
  partNumber: product.partNumber,
  description: product.name,
  stock,
  price: toFils(product.price),
  image: product.image,
});

export const tecdocRow = (article: TecdocArticle): ResultRow => ({
  key: `td:${article.key}`,
  source: "tecdoc",
  product: null,
  article,
  brand: article.supplierName,
  partNumber: article.articleNo,
  description: article.productName ?? "Spare part",
  stock: null,
  price: null,
  image: article.image,
});

export function buildRows(
  query: string,
  products: Product[],
  articles: TecdocArticle[],
  stockOf: (product: Product) => number,
): ResultRow[] {
  const own = new Map(searchOwn(query, products).map((p) => [p.id, p]));
  const tecdoc: ResultRow[] = [];
  for (const article of articles) {
    const match = matchProduct(article, products);
    // TecDoc confirms one of our own items: show our row (with price and stock) instead.
    if (match) own.set(match.id, match);
    else tecdoc.push(tecdocRow(article));
  }
  return [...[...own.values()].map((p) => ownRow(p, stockOf(p))), ...tecdoc];
}
