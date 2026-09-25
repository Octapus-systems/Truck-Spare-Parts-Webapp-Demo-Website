"use client";

import { Check, Package, Plus } from "lucide-react";
import type { Product } from "@/data/products";
import { matchProduct } from "@/lib/tecdoc/match";
import type { TecdocArticle } from "@/lib/tecdoc/types";

export type CatalogActions = {
  products: Product[];
  openProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
  priceLabel: (product: Product) => string;
  requestQuote: (article: TecdocArticle) => void;
};

export function TecdocPartCard({ article, catalog }: { article: TecdocArticle; catalog: CatalogActions }) {
  const match = matchProduct(article, catalog.products);
  return (
    <article className="flex min-w-0 flex-col rounded-[16px] border border-[#e2e2de] bg-white p-4">
      <div className="flex gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#f2f2ef]">
          {article.image ? (
            <img src={article.image} alt="" loading="lazy" className="h-full w-full object-contain p-1.5 mix-blend-multiply" />
          ) : (
            <Package size={26} strokeWidth={1.4} className="text-[#a3a49f]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-[.08em] text-[#777873]">{article.supplierName}</p>
          <h3 className="mt-1 text-[15px] font-semibold leading-5">{article.productName ?? (article.oeMatch ? "OE-equivalent part" : "Spare part")}</h3>
          <p className="mt-1 truncate font-mono text-xs text-[#5f605c]">{article.articleNo}</p>
          {article.oeMatch && (
            <p className="mt-1 truncate text-xs text-[#777873]">
              Replaces {article.oeMatch.brand} {article.oeMatch.number}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#ecece8] pt-3">
        {match ? (
          <>
            <div>
              <strong className="block">{catalog.priceLabel(match)}</strong>
              <span className="inline-flex items-center gap-1 text-xs text-[#4d6755]">
                <Check size={12} /> In our catalogue · TecDoc verified
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => catalog.openProduct(match)} className="rounded-md border border-[#d8d8d4] px-3 py-2 text-sm font-medium">
                View
              </button>
              <button onClick={() => catalog.addToCart(match)} aria-label={`Add ${match.name} to cart`} className="rounded-md bg-[#171816] px-3 py-2 text-sm font-semibold text-white">
                <Plus size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-[#777873]">Not in stock list</span>
            <button onClick={() => catalog.requestQuote(article)} className="rounded-md bg-[#171816] px-3 py-2 text-sm font-semibold text-white">
              Request quote
            </button>
          </>
        )}
      </div>
    </article>
  );
}
