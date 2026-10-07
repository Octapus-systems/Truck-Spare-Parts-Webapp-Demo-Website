"use client";

import { LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TecdocSearchResults } from "@/components/tecdoc/search-results";
import type { Product } from "@/data/products";
import { productPrice } from "@/lib/shop/market";
import { searchOwn } from "@/lib/store/search";
import { useAppState, useCatalog } from "@/lib/store/store";
import { fitsVehicle } from "@/lib/store/garage";
import { useActiveVehicle, vehicleParams } from "./garage";
import { addProductToCart, ProductCard } from "./product-card";
import { partFromArticle, useQuote } from "./quote-dialog";

const SORTS = {
  relevance: { label: "Best match", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a: Product, b: Product) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a: Product, b: Product) => b.price - a.price },
  stock: { label: "Most in stock", fn: (a: Product, b: Product) => b.stock - a.stock },
} as const;
type SortKey = keyof typeof SORTS;


export function PartsBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const products = useCatalog();
  const { prefs } = useAppState();
  const openQuote = useQuote();
  const vehicle = useActiveVehicle();

  const q = params.get("q")?.trim() ?? "";
  const make = params.get("make") ?? "";
  const model = params.get("model") ?? "";
  const year = params.get("year") ?? "";
  const category = params.get("category") ?? "";
  const brand = params.get("brand") ?? "";
  const inStock = params.get("stock") === "1";
  const sort = (params.get("sort") ?? "relevance") as SortKey;
  const view = params.get("view") === "list" ? "list" : "grid";

  const setParam = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  };

  // Base set: text + vehicle. Category/brand/stock facets count within it.
  const base = searchOwn(q, products).filter((p) => !make || fitsVehicle(p, { make, series: model }));
  const filteringMyTruck = !!vehicle && make === vehicle.make && model === vehicle.series;
  const results = base
    .filter((p) => (!category || p.category === category) && (!brand || p.brand === brand) && (!inStock || p.stock > 0))
    .sort(SORTS[sort]?.fn ?? (() => 0));

  const facet = (key: (p: Product) => string) =>
    [...base.reduce((map, p) => map.set(key(p), (map.get(key(p)) ?? 0) + 1), new Map<string, number>())].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

  const title = q ? `Results for “${q}”` : make ? `Parts for ${make}${model ? ` ${model}` : ""}` : category || brand || "All parts";
  type Chip = { label: string; clear: Record<string, null> };
  const chips: Chip[] = [];
  if (make) chips.push({ label: `${make}${model ? ` ${model}` : ""}${year ? ` · ${year}` : ""}`, clear: { make: null, model: null, year: null } });
  if (category) chips.push({ label: category, clear: { category: null } });
  if (brand) chips.push({ label: brand, clear: { brand: null } });
  if (inStock) chips.push({ label: "In stock", clear: { stock: null } });

  const catalog = {
    products,
    openProduct: (p: Product) => router.push(`/parts/${p.id}`),
    addToCart: (p: Product) => addProductToCart(p),
    priceLabel: (p: Product) => productPrice(p, prefs.market),
    requestQuote: (a: Parameters<typeof partFromArticle>[0]) => openQuote(partFromArticle(a)),
  };

  const filters = (
    <div className="grid gap-7">
      <FacetGroup title="Category" items={facet((p) => p.category)} active={category} onPick={(v) => setParam({ category: v === category ? null : v })} />
      <FacetGroup title="Brand" items={facet((p) => p.brand)} active={brand} onPick={(v) => setParam({ brand: v === brand ? null : v })} />
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--s-line)] px-3 py-2.5 text-[14px]">
        <span className="font-medium">In stock only</span>
        <input type="checkbox" checked={inStock} onChange={(e) => setParam({ stock: e.target.checked ? "1" : null })} className="h-4 w-4 accent-[var(--s-text)]" />
      </label>
    </div>
  );

  return (
    <div className="s-container py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-[var(--s-muted)]">
        <Link href="/" className="hover:text-[var(--s-text)]">Home</Link> / <span className="text-[var(--s-text-2)]">Parts</span>
      </nav>
      <div className="mt-3 flex flex-col justify-between gap-4 border-b border-[var(--s-line)] pb-5 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="truncate text-[clamp(26px,3.4vw,36px)] font-semibold tracking-[-.03em]">{title}</h1>
          <p className="tnum mt-1 text-[14px] text-[var(--s-muted)]">
            {results.length} {results.length === 1 ? "part" : "parts"} in our stock
            {q.length >= 3 && " · TecDoc cross-references below"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select aria-label="Sort" value={sort} onChange={(e) => setParam({ sort: e.target.value === "relevance" ? null : e.target.value })} className="s-select !h-10 !w-auto text-[13px]">
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="flex rounded-lg border border-[var(--s-line-strong)] p-0.5" role="group" aria-label="Layout">
            {(["grid", "list"] as const).map((v) => (
              <button key={v} onClick={() => setParam({ view: v === "grid" ? null : v })} aria-pressed={view === v} aria-label={`${v} view`} className="grid h-8 w-8 place-items-center rounded-md text-[var(--s-muted)] aria-pressed:bg-[var(--s-surface-2)] aria-pressed:text-[var(--s-text)]">
                {v === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {vehicle && !filteringMyTruck && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--s-line)] bg-[var(--s-green-soft)] px-4 py-3 text-[14px]">
          <span>
            Shopping for <strong>{vehicle.nickname}</strong>? Parts that fit are marked.
          </span>
          <button
            className="s-btn"
            data-variant="primary"
            data-size="sm"
            onClick={() => {
              const next = new URLSearchParams(vehicleParams(vehicle));
              if (q) next.set("q", q);
              router.replace(`${pathname}?${next}`, { scroll: false });
            }}
          >
            Only parts for my truck
          </button>
        </div>
      )}

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button key={chip.label} onClick={() => setParam(chip.clear)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--s-surface-2)] px-3 text-[13px] font-medium hover:bg-[var(--s-line)]">
              {chip.label} <X size={13} aria-label="Remove filter" />
            </button>
          ))}
          <button onClick={() => setParam({ make: null, model: null, year: null, category: null, brand: null, stock: null })} className="text-[13px] font-medium text-[var(--s-accent)] hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>
        <details className="s-card p-4 lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] font-semibold">
            <SlidersHorizontal size={16} /> Filters
          </summary>
          <div className="mt-4">{filters}</div>
        </details>

        <div className="min-w-0">
          {results.length ? (
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} layout={view} />
              ))}
            </div>
          ) : (
            <div className="s-card p-6">
              <p className="font-semibold">Not in our stock list</p>
              <p className="mt-1 text-[14px] text-[var(--s-text-2)]">
                {q.length >= 3 ? "See TecDoc cross-references below, or" : "Try"} a shorter part number, another brand, or clear the filters.
              </p>
            </div>
          )}

          {q.length >= 3 && (
            <div className="[&>section]:mt-10">
              <TecdocSearchResults key={q} query={q} catalog={catalog} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FacetGroup({ title, items, active, onPick }: { title: string; items: [string, number][]; active: string; onPick: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-semibold uppercase tracking-[.06em] text-[var(--s-muted)]">{title}</legend>
      <ul className="grid gap-0.5">
        {items.map(([name, count]) => (
          <li key={name}>
            <button onClick={() => onPick(name)} aria-pressed={active === name} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-start text-[14px] text-[var(--s-text-2)] hover:bg-[var(--s-surface)] aria-pressed:bg-[var(--s-dark)] aria-pressed:text-white">
              <span className="truncate">{name}</span>
              <span className="tnum text-[12px] opacity-70">{count}</span>
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
