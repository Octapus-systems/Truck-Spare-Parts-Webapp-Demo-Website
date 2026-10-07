"use client";

import { BadgeCheck, Minus, Plus, ShieldCheck, Truck, Warehouse } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CompatibleVehicles } from "@/components/tecdoc/compatible-vehicles";
import { trucks } from "@/data/products";
import { money, productPrice, stockState } from "@/lib/shop/market";
import { VAT_RATE } from "@/lib/store/billing";
import { useAppState, useCatalog } from "@/lib/store/store";
import { FitsBadge } from "./garage";
import { addProductToCart, ProductCard } from "./product-card";
import { partFromProduct, useQuote } from "./quote-dialog";

const truckMakes = [...new Set(trucks.map((t) => t[0]))];

type Tab = "specs" | "oe" | "fitment";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const products = useCatalog();
  const { prefs, cart } = useAppState();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<Tab>("specs");
  const openQuote = useQuote();

  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <div className="s-container py-20 text-center">
        <h1 className="text-2xl font-semibold">Part not found</h1>
        <Link href="/parts" className="s-btn mt-6" data-variant="primary">
          Browse parts
        </Link>
      </div>
    );
  }

  const stock = stockState(product);
  const make = truckMakes.find((m) => product.fitment.some((f) => f.startsWith(m))) ?? null;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const canBuy = product.commercialData !== false;

  return (
    <div className="s-container py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-[var(--s-muted)]">
        <Link href="/" className="hover:text-[var(--s-text)]">Home</Link> /{" "}
        <Link href="/parts" className="hover:text-[var(--s-text)]">Parts</Link> /{" "}
        <Link href={`/parts?category=${encodeURIComponent(product.category)}`} className="hover:text-[var(--s-text)]">{product.category}</Link> /{" "}
        <span className="mono text-[var(--s-text-2)]">{product.partNumber}</span>
      </nav>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <div className="relative grid aspect-[4/3] place-items-center rounded-2xl border border-[var(--s-line)] bg-[var(--s-surface)]">
          <img id="product-image" src={product.image} alt={product.name} className="h-full w-full object-contain p-10 mix-blend-multiply" />
          {product.verified && (
            <span className="s-badge absolute start-4 top-4" data-tone="accent">
              <BadgeCheck size={13} /> Verified listing
            </span>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[13px] font-semibold uppercase tracking-[.08em] text-[var(--s-muted)]">
            {product.brand} · {product.category}
          </p>
          <h1 className="mt-2 text-[clamp(26px,3vw,34px)] font-semibold leading-tight tracking-[-.03em]">{product.name}</h1>
          <FitsBadge product={product} className="mt-3" />
          <dl className="mono mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 break-words text-[13.5px]">
            <dt className="text-[var(--s-muted)]">Part no.</dt>
            <dd>{product.partNumber}</dd>
            <dt className="text-[var(--s-muted)]">OE</dt>
            <dd>{product.oe.join(", ")}</dd>
            <dt className="text-[var(--s-muted)]">SKU</dt>
            <dd>{product.sku}</dd>
          </dl>

          <div className="s-card mt-6 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="tnum text-[32px] font-semibold tracking-[-.03em]">{productPrice(product, prefs.market)}</p>
                {canBuy && (
                  <p className="tnum text-[13px] text-[var(--s-muted)]">
                    excl. VAT · {money(product.price * (1 + VAT_RATE), prefs.market)} incl. 5% VAT
                  </p>
                )}
              </div>
              <span className="s-badge" data-tone={stock.tone}>
                {stock.label}
              </span>
            </div>
            {canBuy ? (
              <>
                <div className="mt-5 flex gap-3">
                  <div className="flex items-center rounded-lg border border-[var(--s-line-strong)]">
                    <button className="grid h-12 w-11 place-items-center" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      <Minus size={16} />
                    </button>
                    <span className="tnum w-8 text-center font-semibold" aria-live="polite">{qty}</span>
                    <button className="grid h-12 w-11 place-items-center" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <button className="s-btn min-w-0 flex-1 !whitespace-normal" data-variant="primary" data-size="lg" onClick={() => addProductToCart(product, qty, document.querySelector("#product-image"))}>
                    Add to cart{cart[product.id] ? ` · ${cart[product.id]} in cart` : ""}
                  </button>
                </div>
                <button
                  className="s-btn mt-2 w-full"
                  data-variant="outline"
                  onClick={() => {
                    addProductToCart(product, qty);
                    router.push("/checkout");
                  }}
                >
                  Buy now
                </button>
                {product.stock <= 0 && (
                  <button className="mt-2 w-full text-center text-[13px] font-medium text-[var(--s-accent)] hover:underline" onClick={() => openQuote(partFromProduct(product))}>
                    Out of stock — request a quote with lead time
                  </button>
                )}
                {qty > product.stock && (
                  <p className="mt-3 text-[13px] text-[var(--s-amber)]">
                    {product.stock > 0 ? `Only ${product.stock} in stock — ` : ""}the rest will be ordered in; our counter confirms the lead time.
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-4 text-[14px] text-[var(--s-text-2)]">This listing is for reference. Ask the counter for price and availability.</p>
                <button className="s-btn mt-4 w-full" data-variant="primary" data-size="lg" onClick={() => openQuote(partFromProduct(product))}>
                  Request a quote
                </button>
              </>
            )}
            <ul className="mt-5 grid gap-2 border-t border-[var(--s-line)] pt-4 text-[13.5px] text-[var(--s-text-2)]">
              <li className="flex items-center gap-2"><Warehouse size={16} className="text-[var(--s-muted)]" /> Stocked at {product.warehouse}</li>
              <li className="flex items-center gap-2"><Truck size={16} className="text-[var(--s-muted)]" /> Same-day dispatch on orders before 2 pm</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[var(--s-muted)]" /> Fitment checked by our counter before invoicing</li>
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div role="tablist" aria-label="Part information" className="flex gap-1 border-b border-[var(--s-line)]">
          {(
            [
              ["specs", "Specifications"],
              ["oe", "OE numbers"],
              ["fitment", "Vehicle fitment"],
            ] as const
          ).map(([key, label]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)} className="-mb-px border-b-2 border-transparent px-4 py-3 text-[14px] font-medium text-[var(--s-muted)] aria-selected:border-[var(--s-text)] aria-selected:text-[var(--s-text)]">
              {label}
            </button>
          ))}
        </div>
        <div role="tabpanel" className="py-6">
          {tab === "specs" && (
            <dl className="grid max-w-2xl overflow-hidden rounded-xl border border-[var(--s-line)] text-[14px]">
              {Object.entries(product.specs).map(([name, value], i) => (
                <div key={name} className={`grid grid-cols-[200px_1fr] px-4 py-3 ${i % 2 ? "bg-white" : "bg-[var(--s-surface)]"}`}>
                  <dt className="text-[var(--s-muted)]">{name}</dt>
                  <dd className="tnum font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "oe" && (
            <ul className="grid max-w-2xl gap-2">
              {product.oe.map((oe) => (
                <li key={oe} className="flex items-center justify-between rounded-lg border border-[var(--s-line)] px-4 py-3">
                  <span className="mono">{oe}</span>
                  <span className="text-[13px] text-[var(--s-muted)]">{make ?? "OE"} reference</span>
                </li>
              ))}
            </ul>
          )}
          {tab === "fitment" && (
            <CompatibleVehicles
              make={make}
              oe={product.oe[0]}
              fallback={
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.fitment.map((fit) => (
                    <li key={fit} className="flex items-center gap-2 rounded-lg border border-[var(--s-line)] px-4 py-3 text-[14px]">
                      <Truck size={16} className="text-[var(--s-muted)]" /> {fit}
                    </li>
                  ))}
                </ul>
              }
            />
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="s-h2">More in {product.category}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
