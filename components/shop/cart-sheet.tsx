"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { money } from "@/lib/shop/market";
import { VAT_RATE } from "@/lib/store/billing";
import { setCartQty } from "@/lib/store/reducer";
import { update, useAppState, useCatalog } from "@/lib/store/store";

export function useCartItems() {
  const { cart } = useAppState();
  const products = useCatalog();
  const items = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((item): item is { product: (typeof products)[number]; qty: number } => !!item.product && item.qty > 0);
  const subtotal = items.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
  const count = items.reduce((sum, { qty }) => sum + qty, 0);
  return { items, subtotal, count };
}

export function CartSheet({ label }: { label: string }) {
  const { prefs } = useAppState();
  const { items, subtotal, count } = useCartItems();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button id="cart-button" className="s-btn ms-1" data-variant="primary" data-size="sm" aria-label={`${label}, ${count} items`}>
          <ShoppingBag size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{label}</span>
          {count > 0 && <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] text-[var(--s-text)]">{count}</span>}
        </button>
      </SheetTrigger>
      <SheetContent className="shop flex w-full flex-col gap-0 p-0 sm:max-w-[420px]">
        <SheetHeader className="border-b border-[var(--s-line)] px-5 py-4">
          <SheetTitle className="text-[17px] font-semibold">Your cart · {count}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto px-5">
          {items.length === 0 ? (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto mb-3 text-[var(--s-muted)]" />
                <p className="font-medium">Your cart is empty</p>
                <p className="mt-1 text-[14px] text-[var(--s-muted)]">Search a part number or browse by vehicle.</p>
                <Link href="/parts" onClick={() => setOpen(false)} className="s-btn mt-5" data-variant="outline" data-size="sm">
                  Browse parts
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--s-line)]">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <img src={product.image} alt="" className="h-16 w-16 shrink-0 rounded-lg bg-[var(--s-surface)] object-contain p-1.5 mix-blend-multiply" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/parts/${product.id}`} onClick={() => setOpen(false)} className="line-clamp-2 text-[14px] font-medium hover:underline">
                      {product.name}
                    </Link>
                    <p className="mono mt-0.5 text-[12px] text-[var(--s-muted)]">
                      {product.brand} · {product.partNumber}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-[var(--s-line)]">
                        <button className="grid h-8 w-8 place-items-center" aria-label="Decrease quantity" onClick={() => update((s) => setCartQty(s, product.id, qty - 1))}>
                          {qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="tnum w-7 text-center text-[14px]">{qty}</span>
                        <button className="grid h-8 w-8 place-items-center" aria-label="Increase quantity" onClick={() => update((s) => setCartQty(s, product.id, qty + 1))}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong className="tnum text-[14px]">{money(product.price * qty, prefs.market)}</strong>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-[var(--s-line)] px-5 py-4">
            <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-[14px]">
              <dt className="text-[var(--s-muted)]">Subtotal</dt>
              <dd className="tnum">{money(subtotal, prefs.market)}</dd>
              <dt className="text-[var(--s-muted)]">VAT 5% (estimate)</dt>
              <dd className="tnum">{money(subtotal * VAT_RATE, prefs.market)}</dd>
              <dt className="mt-1 font-semibold">Estimated total</dt>
              <dd className="tnum mt-1 font-semibold">{money(subtotal * (1 + VAT_RATE), prefs.market)}</dd>
            </dl>
            <Link href="/checkout" onClick={() => setOpen(false)} className="s-btn mt-4 w-full" data-variant="primary" data-size="lg">
              Checkout
            </Link>
            <p className="mt-2 text-center text-[12px] text-[var(--s-muted)]">Pay on pickup or delivery. Invoice issued in AED.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
