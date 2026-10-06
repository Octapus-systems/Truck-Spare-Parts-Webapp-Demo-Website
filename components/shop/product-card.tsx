"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { productPrice, stockState } from "@/lib/shop/market";
import { addToCart } from "@/lib/store/reducer";
import { update, useAppState } from "@/lib/store/store";
import type { TecdocArticle } from "@/lib/tecdoc/types";

export const addProductToCart = (product: Product, qty = 1) => {
  update((s) => addToCart(s, product.id, qty));
  toast.success(`${product.brand} ${product.partNumber} added to cart`, { description: product.name });
};

/** TecDoc parts we don't stock: the counter quotes them. Demo: no request is sent. */
export const requestTecdocQuote = (article: TecdocArticle) =>
  toast.info(`Quote requested: ${article.supplierName} ${article.articleNo}`, {
    description: "Demo — our counter team would call you back with price and lead time.",
  });

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const { prefs, cart } = useAppState();
  const stock = stockState(product);
  const inCart = cart[product.id] ?? 0;
  const href = `/parts/${product.id}`;

  if (layout === "list") {
    return (
      <article className="s-card flex items-center gap-4 p-3 sm:p-4" data-hover>
        <Link href={href} className="shrink-0">
          <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg bg-[var(--s-surface)] object-contain p-2 mix-blend-multiply sm:h-24 sm:w-24" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[.06em] text-[var(--s-muted)]">
            {product.brand} · {product.category}
          </p>
          <Link href={href} className="mt-0.5 block truncate text-[15px] font-semibold hover:underline">
            {product.name}
          </Link>
          <p className="mono mt-1 truncate text-[12.5px] text-[var(--s-text-2)]">
            {product.partNumber} · OE {product.oe.join(", ")}
          </p>
          <p className="mt-1 hidden truncate text-[13px] text-[var(--s-muted)] sm:block">Fits {product.fitment.join(", ")}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <strong className="tnum text-[17px]">{productPrice(product, prefs.market)}</strong>
          <span className="s-badge" data-tone={stock.tone}>
            {stock.label}
          </span>
          <AddButton product={product} inCart={inCart} />
        </div>
      </article>
    );
  }

  return (
    <article className="s-card group flex flex-col overflow-hidden" data-hover>
      <Link href={href} className="relative block aspect-[4/3] bg-[var(--s-surface)]">
        <img src={product.image} alt={product.name} className="h-full w-full object-contain p-6 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.03]" />
        {product.verified && (
          <span className="s-badge absolute start-3 top-3" data-tone="accent">
            <Check size={12} /> Verified
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[.06em] text-[var(--s-muted)]">{product.brand}</p>
        <Link href={href} className="mt-1 line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-[1.3] hover:underline">
          {product.name}
        </Link>
        <p className="mono mt-2 truncate text-[12.5px] text-[var(--s-text-2)]">
          {product.partNumber} · OE {product.oe[0]}
        </p>
        <p className="mt-1 truncate text-[13px] text-[var(--s-muted)]">Fits {product.fitment.slice(0, 2).join(", ")}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <strong className="tnum block text-[18px] tracking-[-.01em]">{productPrice(product, prefs.market)}</strong>
            <span className="s-badge mt-1" data-tone={stock.tone}>
              {stock.label}
            </span>
          </div>
          <AddButton product={product} inCart={inCart} />
        </div>
      </div>
    </article>
  );
}

function AddButton({ product, inCart }: { product: Product; inCart: number }) {
  if (product.commercialData === false) {
    return (
      <Link href={`/parts/${product.id}`} className="s-btn" data-variant="outline" data-size="sm">
        Details
      </Link>
    );
  }
  return (
    <button className="s-btn" data-variant={inCart ? "outline" : "primary"} data-size="sm" onClick={() => addProductToCart(product)} aria-label={`Add ${product.name} to cart`}>
      <Plus size={15} aria-hidden="true" />
      {inCart ? `In cart · ${inCart}` : "Add"}
    </button>
  );
}
