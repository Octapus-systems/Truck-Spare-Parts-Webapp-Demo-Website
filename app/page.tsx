"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CircleGauge,
  Cog,
  Disc3,
  Filter,
  Gauge,
  Grid3X3,
  Columns3,
  List,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  ShoppingCart,
  SlidersHorizontal,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast, Toaster } from "sonner";
import { ShaderHeroBackground } from "@/components/ui/shader-hero";
import { seedProducts, trucks, type Product } from "@/data/products";

const categories = [
  { name: "Braking", icon: Disc3 },
  { name: "Engine", icon: Cog },
  { name: "Filters", icon: SlidersHorizontal },
  { name: "Suspension", icon: Gauge },
  { name: "Electrical", icon: CircleGauge },
  { name: "Air & Brake", icon: Settings2 },
];
const countIn = (products: Product[], category: string) =>
  products.filter((p) => p.category === category).length;
const normalize = (value: string) =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/^A(?=\d)/, "");
type Market = "UAE" | "Qatar" | "Saudi" | "USD";
const marketConfig: Record<
  Market,
  { currency: string; locale: string; factor: number }
> = {
  UAE: { currency: "AED", locale: "en-AE", factor: 1 },
  Qatar: { currency: "QAR", locale: "en-QA", factor: 0.99 },
  Saudi: { currency: "SAR", locale: "en-SA", factor: 1.02 },
  USD: { currency: "USD", locale: "en-US", factor: 1 / 3.6725 },
};
const money = (value: number, market: Market) =>
  new Intl.NumberFormat(marketConfig[market].locale, {
    style: "currency",
    currency: marketConfig[market].currency,
    maximumFractionDigits: market === "USD" ? 2 : 0,
  }).format(value * marketConfig[market].factor);
const productPrice = (product: Product, market: Market) =>
  product.commercialData === false ? "Contact for price" : money(product.price, market);
const productAvailability = (product: Product) =>
  product.commercialData === false ? "Check availability" : `${product.stock} available`;
type View = "home" | "catalog" | "results" | "product" | "admin";

export default function Home() {
  const [products, setProducts] = useState(seedProducts),
    [view, setView] = useState<View>("home"),
    [query, setQuery] = useState(""),
    [activeQuery, setActiveQuery] = useState(""),
    [selected, setSelected] = useState<Product | null>(null),
    [cart, setCart] = useState<Record<string, number>>({}),
    [brand, setBrand] = useState(""),
    [model, setModel] = useState(""),
    [year, setYear] = useState(""),
    [locale, setLocale] = useState<"en" | "ar">("en"),
    [market, setMarket] = useState<Market>("UAE"),
    [rfqOpen, setRfqOpen] = useState(false),
    [menuOpen, setMenuOpen] = useState(false);
  const results = useMemo(() => {
    const q = normalize(activeQuery);
    if (!q) return products;
    return products.filter((p) =>
      [
        p.name,
        p.brand,
        p.partNumber,
        p.sku,
        p.category,
        ...p.oe,
        ...p.fitment,
      ].some((field) => normalize(field).includes(q)),
    );
  }, [activeQuery, products]);
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((x) => x.product);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0),
    cartTotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.qty,
      0,
    );
  const runSearch = (value = query) => {
    setQuery(value.trim());
    setActiveQuery(value.trim());
    setView("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openProduct = (p: Product) => {
    setSelected(p);
    setView("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const addToCart = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    toast.success(`${p.brand} ${p.partNumber} added to cart`);
  };
  const navigate = (next: View) => {
    setView(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openVehicleCatalog = (vehicle: string) => {
    setActiveQuery(vehicle);
    setView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openCatalog = () => {
    setActiveQuery(brand && model ? `${brand} ${model.split(" /")[0]}` : "");
    setView("catalog");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool?: (tool: unknown, options?: unknown) => void;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    context.registerTool(
      {
        name: "search_demo_parts",
        title: "Search demo parts",
        description:
          "Search the synthetic truck-parts catalogue by OE number, part number, brand, or truck.",
        inputSchema: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute: (input: unknown) => {
          const value = String((input as { query?: string }).query || "");
          setQuery(value);
          setActiveQuery(value);
          setView("results");
          return { query: value, note: "Search opened in the visible demo." };
        },
      },
      { signal: lifecycle.signal },
    );
    return () => lifecycle.abort();
  }, []);

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="premium-store min-h-[100dvh] bg-[#f5f5f7] text-[#1d1d1f]"
    >
      <Toaster richColors position="top-right" />
      <header className="premium-nav redesigned-nav sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
        <div className="nav-inner mx-auto flex items-center">
          <button
            onClick={() => navigate("home")}
            className="nav-brand"
            aria-label="Desert Route Parts home"
          >
            <span className="nav-monogram" aria-hidden="true">
              <svg width="24" height="26" viewBox="0 0 24 26" fill="none"><path d="M4 3h6c7 0 10 4 10 10s-3 10-10 10H4V3Z" stroke="currentColor" strokeWidth="2.3"/><path d="m10 8 5 5-5 5M4 13h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <span className="nav-wordmark">
              <strong className="block text-[15px] leading-4 tracking-[-.02em]">
                Desert Route
              </strong>
              <span className="text-[10px] font-medium tracking-[.1em] text-[#787774]">
                TRUCK PARTS
              </span>
            </span>
          </button>
          <nav aria-label="Main navigation" className="nav-links">
            <button
              onClick={() => navigate("home")}
              aria-current={view === "home" ? "page" : undefined}
            >
              Overview
            </button>
            <button onClick={openCatalog} aria-current={view === "catalog" || view === "results" || view === "product" ? "page" : undefined}>All parts</button>
            <button
              onClick={() => navigate("admin")}
              aria-current={view === "admin" ? "page" : undefined}
            >
              Admin
            </button>
          </nav>
          <select
            aria-label="Display currency"
            value={market}
            onChange={(e) => setMarket(e.target.value as Market)}
            className="nav-currency"
          >
            <option value="UAE">AED</option>
            <option value="Qatar">QAR</option>
            <option value="Saudi">SAR</option>
            <option value="USD">USD</option>
          </select>
          <button
            onClick={() => setLocale((value) => (value === "en" ? "ar" : "en"))}
            className="nav-language"
            aria-label="Switch language"
          >
            {locale === "en" ? "عربي" : "EN"}
          </button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="nav-cart"
                aria-label={`Open cart, ${cartCount} items`}
              >
                <ShoppingCart size={17} strokeWidth={1.6} />
                <span className="nav-cart-label">Cart</span>
                {cartCount > 0 && (
                  <span className="nav-cart-count">
                    {cartCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Order cart</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col px-4 pb-5">
                <div className="flex-1 space-y-4 overflow-auto py-5">
                  {cartItems.length === 0 ? (
                    <div className="grid min-h-64 place-items-center text-center text-slate-500">
                      <div>
                        <ShoppingCart className="mx-auto mb-3" />
                        <p>Your cart is empty</p>
                        <p className="text-sm">
                          Add demo parts from the catalogue.
                        </p>
                      </div>
                    </div>
                  ) : (
                    cartItems.map(({ product, qty }) => (
                      <div
                        key={product.id}
                        className="flex gap-3 border-b border-slate-200 pb-4"
                      >
                        <ProductVisual
                          category={product.category}
                          image={product.image}
                          alt={product.name}
                          compact
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold">{product.name}</p>
                          <p className="text-sm text-slate-500">
                            {product.brand} · {product.partNumber}
                          </p>
                          <p className="mt-2 font-bold">
                            {money(product.price * qty, market)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCart((c) => ({
                                ...c,
                                [product.id]: Math.max(0, qty - 1),
                              }))
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span>{qty}</span>
                          <button
                            onClick={() =>
                              setCart((c) => ({ ...c, [product.id]: qty + 1 }))
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="border-t border-slate-200 pt-5">
                    <div className="mb-4 flex justify-between text-lg font-bold">
                      <span>Subtotal</span>
                      <span>{money(cartTotal, market)}</span>
                    </div>
                    <p className="mb-4 text-sm text-slate-500">
                      VAT and delivery calculated after account review.
                    </p>
                    <Button
                      onClick={() => setRfqOpen(true)}
                      className="h-12 w-full rounded-md bg-[#171816] hover:bg-[#333431]"
                    >
                      Request formal quotation
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="ghost"
            size="icon"
            className="nav-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        {menuOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation" className="nav-mobile">
            <button
              onClick={() => navigate("home")}
              className="block w-full py-3 text-left font-semibold"
            >
              Overview
            </button>
            <button onClick={() => { openCatalog(); setMenuOpen(false); }}>All parts <span aria-hidden="true">↗</span></button>
            <button
              onClick={() => navigate("admin")}
              className="block w-full py-3 text-left font-semibold"
            >
              Admin
            </button>
          </nav>
        )}
      </header>
      {view === "home" && (
        <HomeView
          query={query}
          setQuery={setQuery}
          runSearch={runSearch}
          brand={brand}
          setBrand={setBrand}
          model={model}
          setModel={setModel}
          year={year}
          setYear={setYear}
          products={products}
          openProduct={openProduct}
          addToCart={addToCart}
          locale={locale}
          market={market}
          openVehicleCatalog={openVehicleCatalog}
        />
      )}
      {view === "catalog" && (
        <CatalogBoard
          vehicle={activeQuery}
          products={products}
          setView={setView}
          openProduct={openProduct}
          addToCart={addToCart}
          market={market}
          brand={brand}
          setBrand={setBrand}
          model={model}
          setModel={setModel}
          year={year}
          setYear={setYear}
          setVehicle={setActiveQuery}
        />
      )}
      {view === "results" && (
        <ResultsView
          query={activeQuery}
          results={results}
          setView={setView}
          openProduct={openProduct}
          addToCart={addToCart}
          market={market}
        />
      )}
      {view === "product" && selected && (
        <ProductView
          product={products.find((p) => p.id === selected.id) || selected}
          products={products}
          setView={setView}
          openProduct={openProduct}
          addToCart={addToCart}
          market={market}
        />
      )}
      {view === "admin" && (
        <AdminView
          products={products}
          setProducts={setProducts}
          setView={setView}
          market={market}
        />
      )}
      <Dialog open={rfqOpen} onOpenChange={setRfqOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quotation request sent</DialogTitle>
            <DialogDescription>
              This is a demo. In production, the request would be routed to your
              UAE sales team with stock, customer and delivery details.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            <Check className="mb-2" />
            Demo RFQ <strong>DRQ-2026-1048</strong> created for{" "}
            {money(cartTotal, market)}.
          </div>
          <Button
            onClick={() => {
              setRfqOpen(false);
              setCart({});
            }}
            className="bg-[#102235]"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
      <footer className="border-t border-[#e8e8e4] bg-[#fbfbfa] px-4 py-10 text-[#777873]">
        <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-5 md:flex-row">
          <div>
            <strong className="text-[#20211f]">Desert Route Truck Parts</strong>
            <p className="mt-2 max-w-xl text-sm">
              Working product concept built with synthetic data. No catalogue
              records represent commercial availability.
            </p>
          </div>
          <div className="text-sm md:text-right">
            <p>UAE • Qatar • Saudi Arabia</p>
            <p className="mt-1 text-[#92938f]">
              Prices shown in {marketConfig[market].currency}, excluding local
              taxes. {market === "USD" && "USD estimates use AED 3.6725 per US dollar."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SearchAutocomplete({
  query,
  setQuery,
  runSearch,
  products,
  openProduct,
  compact = false,
}: {
  query: string;
  setQuery: (value: string) => void;
  runSearch: (value?: string) => void;
  products: Product[];
  openProduct: (product: Product) => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const suggestionsId = useId();
  const normalizedQuery = normalize(query);
  const productMatches = normalizedQuery
    ? products
        .filter((product) =>
          [
            product.name,
            product.brand,
            product.partNumber,
            product.sku,
            ...product.oe,
            ...product.fitment,
          ].some((value) => normalize(value).includes(normalizedQuery)),
        )
        .slice(0, 4)
    : [];
  const vehicleMatches = normalizedQuery
    ? [...new Set(products.flatMap((product) => product.fitment))]
        .filter((vehicle) => normalize(vehicle).includes(normalizedQuery))
        .slice(0, 6)
    : [];
  const categoryMatches = normalizedQuery
    ? categories
        .filter((category) => normalize(category.name).includes(normalizedQuery))
        .slice(0, 3)
    : [];
  const showPanel =
    open && query.trim().length > 0;

  const submit = () => {
    setOpen(false);
    runSearch(query);
  };

  return (
    <div className="relative w-full" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="flex"
      >
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            size={compact ? 17 : 20}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8b87]"
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
            }}
            role="combobox"
            aria-label="Search parts and vehicles"
            aria-expanded={showPanel}
            aria-controls={suggestionsId}
            aria-autocomplete="list"
            placeholder="Search part number, OE number, name or vehicle"
            className={`${compact ? "h-11 pl-11 pr-4 text-sm" : "h-16 pl-12 pr-5 text-base md:text-lg"} w-full rounded-l-md border border-r-0 border-[#d8d8d4] bg-white text-[#20211f] outline-none transition placeholder:text-[#9a9b97] focus:border-[#81827e] focus:ring-2 focus:ring-[#222]/10`}
          />
        </div>
        <button
          type="submit"
          className={`${compact ? "h-11 px-4 text-sm" : "h-16 px-6 text-sm md:px-8"} rounded-r-md bg-[#171816] font-semibold text-white transition hover:bg-[#333431] active:scale-[.98]`}
        >
          {compact ? "Search" : "Find parts"}
        </button>
      </form>

      {showPanel && (
        <div
          id={suggestionsId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-auto rounded-lg border border-[#e5e5e1] bg-white p-2 shadow-[0_18px_48px_rgba(30,30,27,.09)]"
        >
          {productMatches.length > 0 && (
            <div>
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#8a8b87]">
                Parts
              </p>
              {productMatches.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(product.partNumber);
                    setOpen(false);
                    openProduct(product);
                  }}
                  className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-[#f5f5f2]"
                >
                  <img
                    src={product.image}
                    alt=""
                    className="h-11 w-11 rounded-md bg-[#f3f3f0] object-cover"
                  />
                  <span className="min-w-0">
                    <strong className="block truncate text-sm font-semibold">
                      {product.name}
                    </strong>
                    <span className="block truncate text-xs text-[#777873]">
                      {product.brand} · {product.partNumber} · OE {product.oe[0]}
                    </span>
                  </span>
                  <span className="hidden text-xs font-medium text-[#4d6755] sm:block">
                    {product.stock} available
                  </span>
                </button>
              ))}
            </div>
          )}

          {vehicleMatches.length > 0 && (
            <div className="mt-1 border-t border-[#eeeeeb] pt-1">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#8a8b87]">
                Vehicle variants
              </p>
              {vehicleMatches.map((vehicle) => (
                <button
                  key={vehicle}
                  type="button"
                  role="option"
                  aria-selected="false"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    const value = vehicle;
                    setQuery(value);
                    setOpen(false);
                    runSearch(value);
                  }}
                  className="flex w-full items-center justify-between gap-4 rounded-md px-3 py-2.5 text-left transition hover:bg-[#f5f5f2]"
                >
                  <span>
                    <strong className="block text-sm font-semibold">{vehicle}</strong>
                    <span className="text-xs text-[#777873]">View matching parts</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-[#777873]">
                    {products.filter((product) => product.fitment.includes(vehicle)).length} parts
                  </span>
                </button>
              ))}
            </div>
          )}

          {categoryMatches.length > 0 && (
            <div className="mt-1 border-t border-[#eeeeeb] px-3 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[.12em] text-[#8a8b87]">
                Categories
              </p>
              <div className="flex flex-wrap gap-2">
                {categoryMatches.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setQuery(category.name);
                      setOpen(false);
                      runSearch(category.name);
                    }}
                    className="rounded-md bg-[#f1f1ee] px-3 py-1.5 text-xs font-medium hover:bg-[#e7e7e2]"
                  >
                    {category.name} · {countIn(products, category.name)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!productMatches.length &&
            !vehicleMatches.length &&
            !categoryMatches.length && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={submit}
                className="w-full rounded-md px-3 py-4 text-left text-sm text-[#696a66] hover:bg-[#f5f5f2]"
              >
                Search the full catalogue for “{query}”
              </button>
            )}
        </div>
      )}
    </div>
  );
}

function HomeView({
  query,
  setQuery,
  runSearch,
  brand,
  setBrand,
  model,
  setModel,
  year,
  setYear,
  products,
  openProduct,
  addToCart,
  locale,
  market,
  openVehicleCatalog,
}: {
  query: string;
  setQuery: (v: string) => void;
  runSearch: (v?: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  year: string;
  setYear: (v: string) => void;
  products: Product[];
  openProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
  locale: "en" | "ar";
  market: Market;
  openVehicleCatalog: (vehicle: string) => void;
}) {
  const makes = [...new Set(trucks.map((truck) => truck[0]))];
  const selectedModels = trucks
    .filter((truck) => truck[0] === brand)
    .flatMap((truck) => truck[1].split(" / "));
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <main className="premium-home">
      <section className="premium-hero search-first-hero">
        <ShaderHeroBackground />
        <div className="hero-copy">
        <h1>
          {locale === "ar"
            ? "اعثر على القطعة الصحيحة، بسرعة."
            : <>Your truck.<br /><span>Your part.</span></>}
        </h1>
        <p className="hero-description">
          {locale === "ar"
            ? "ابحث برقم OE أو رقم القطعة أو اسم المنتج أو طراز الشاحنة."
            : "Found in seconds. Search a number, explore a model, and compare your options."}
        </p>
        </div>
        <div className="hero-search-panel">
          <div className="search-panel-title"><strong>What are you looking for?</strong><span>Part number, name, or truck model</span></div>
          <SearchAutocomplete
            query={query}
            setQuery={setQuery}
            runSearch={runSearch}
            products={products}
            openProduct={openProduct}
          />
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#777873]">
            <span>Popular:</span>
            {["9424212112", "Brake disc", "MAN TGX", "Air filter"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    runSearch(suggestion);
                  }}
                  className="border-b border-[#c9c9c5] text-[#3b3c38] transition hover:border-[#222]"
                >
                  {suggestion}
                </button>
              ),
            )}
          </div>
        </div>
        <a href="#vehicle-picker" className="hero-link hero-vehicle-link">Prefer to browse? Select your truck <span aria-hidden="true">↓</span></a>
      </section>

      <section id="vehicle-picker" className="vehicle-section">
        <div className="mx-auto max-w-[1120px] px-4 py-14 md:px-8 md:py-16">
          <div className="mb-7 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a8b87]">
                Find by vehicle
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.025em]">
                Select your truck
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-[#777873] md:block">
              Choose a make and model. We’ll narrow down your parts.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-[.7fr_1fr_1.2fr_auto]">
            <select
              aria-label="Vehicle year"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-12 rounded-md border border-[#dcdcd8] bg-white px-4 text-sm font-medium outline-none focus:border-[#858681] focus:ring-2 focus:ring-[#222]/10"
            >
              <option value="">Year (optional)</option>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <select
              aria-label="Vehicle make"
              value={brand}
              onChange={(event) => {
                setBrand(event.target.value);
                setModel("");
              }}
              className="h-12 rounded-md border border-[#dcdcd8] bg-white px-4 text-sm font-medium outline-none focus:border-[#858681] focus:ring-2 focus:ring-[#222]/10"
            >
              <option value="">Make</option>
              {makes.map((make) => (
                <option key={make}>{make}</option>
              ))}
            </select>
            <select
              aria-label="Vehicle model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
              disabled={!brand}
              className="h-12 rounded-md border border-[#dcdcd8] bg-white px-4 text-sm font-medium outline-none focus:border-[#858681] focus:ring-2 focus:ring-[#222]/10 disabled:bg-[#f6f6f3] disabled:text-[#aaa]"
            >
              <option value="">Model / series</option>
              {selectedModels.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button
              disabled={!brand || !model}
              onClick={() => openVehicleCatalog(`${brand} ${model.split(" /")[0]}`)}
              className="h-12 rounded-md bg-[#171816] px-7 text-sm font-semibold text-white transition hover:bg-[#333431] disabled:cursor-not-allowed disabled:bg-[#d7d7d2]"
            >
              Browse catalog
            </button>
          </div>
        </div>
      </section>

      <section className="category-section mx-auto max-w-[1120px] px-4 py-20 md:px-8 md:py-24">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a8b87]">
              Browse
            </p>
            <h2 className="mt-2 text-4xl font-semibold tracking-[-.035em]">
              Every system. Covered.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#777873]">
              Start with a system when you do not have a part or OE number.
            </p>
          </div>
          <div className="category-grid">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => runSearch(category.name)}
                  className="category-card"
                >
                  <span className="category-emblem" aria-hidden="true">
                    <span className="category-emblem-inner"><Icon size={48} strokeWidth={1.35} /></span>
                  </span>
                  <span className="text-lg font-medium tracking-[-.015em]">
                    {category.name}
                  </span>
                  <span className="font-mono text-xs text-[#8a8b87]">
                    Explore <ArrowRight size={12} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="mx-auto max-w-[1120px] px-4 py-16 md:px-8 md:py-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a8b87]">
                In stock
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.025em]">
                Frequently ordered
              </h2>
            </div>
            <button
              onClick={() => runSearch("")}
              className="text-sm font-medium underline decoration-[#c8c8c3] underline-offset-4 hover:decoration-[#222]"
            >
              View catalogue
            </button>
          </div>
          <div className="featured-grid">
            {featured.map((product) => (
              <article
                key={product.id}
                className="featured-card"
              >
                <button onClick={() => openProduct(product)}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-16 w-16 rounded-md bg-[#f4f4f1] object-cover"
                  />
                </button>
                <button
                  onClick={() => openProduct(product)}
                  className="min-w-0 text-left"
                >
                  <strong className="block truncate font-medium">
                    {product.name}
                  </strong>
                  <span className="mt-1 block font-mono text-xs text-[#777873]">
                    {product.brand} · {product.partNumber} · OE {product.oe[0]}
                  </span>
                </button>
                <div className="text-left sm:text-right">
                  <strong className="block text-sm">{money(product.price, market)}</strong>
                  <span className="text-xs text-[#4d6755]">{product.stock} available</span>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  className="h-9 rounded-md border border-[#d8d8d4] px-4 text-sm font-medium transition hover:bg-[#f3f3f0]"
                >
                  Add
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function CatalogBoard({
  vehicle,
  products,
  setView,
  openProduct,
  addToCart,
  market,
  brand,
  setBrand,
  model,
  setModel,
  year,
  setYear,
  setVehicle,
}: {
  vehicle: string;
  products: Product[];
  setView: (v: View) => void;
  openProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
  market: Market;
  brand: string;
  setBrand: (value: string) => void;
  model: string;
  setModel: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  setVehicle: (value: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"kanban" | "grid" | "list">("kanban");
  const vehicleKey = normalize(vehicle);
  const makes = [...new Set(trucks.map((truck) => truck[0]))];
  const selectedModels = trucks
    .filter((truck) => truck[0] === brand)
    .flatMap((truck) => truck[1].split(" / "));
  const isCompatible = (product: Product) =>
    product.fitment.some((fitment) => {
      const fitmentKey = normalize(fitment);
      return fitmentKey.includes(vehicleKey) || vehicleKey.includes(fitmentKey);
    });

  return (
    <main className="catalog-board-page">
      <div className="catalog-board-header">
        <button
          onClick={() => setView("home")}
          className="catalog-back"
        >
          <ArrowLeft size={16} /> Change vehicle
        </button>
        <div className="catalog-board-heading">
          <div>
            <p className="catalog-kicker">Parts catalog</p>
            <h1>{vehicle ? `Parts for your ${vehicle}` : "All parts, organized by system"}</h1>
            <p>
              Browse every section. Compatible items are highlighted and listed first.
            </p>
          </div>
        </div>
        <section className="catalog-compatibility" aria-label="Vehicle compatibility check">
          <div className="catalog-compatibility-title">
            <span className="catalog-category-logo"><Truck size={22} strokeWidth={1.7} /></span>
            <span><strong>Check compatibility</strong><small>Choose your vehicle to highlight matching parts</small></span>
          </div>
          <div className="catalog-vehicle-fields">
            <select aria-label="Vehicle year" value={year} onChange={(event) => setYear(event.target.value)}>
              <option value="">Year</option>
              {[2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017].map((value) => <option key={value}>{value}</option>)}
            </select>
            <select aria-label="Vehicle make" value={brand} onChange={(event) => { setBrand(event.target.value); setModel(""); setVehicle(""); }}>
              <option value="">Make</option>
              {makes.map((make) => <option key={make}>{make}</option>)}
            </select>
            <select aria-label="Vehicle model" value={model} disabled={!brand} onChange={(event) => setModel(event.target.value)}>
              <option value="">Model</option>
              {selectedModels.map((value) => <option key={value}>{value}</option>)}
            </select>
            <button
              disabled={!brand || !model}
              onClick={() => setVehicle(`${brand} ${model.split(" /")[0]}`)}
            >
              <Check size={17} /> Check
            </button>
          </div>
          {vehicle && <p className="catalog-compatibility-result"><Check size={14} /> Showing matches for {year ? `${year} ` : ""}{vehicle}. All other catalog parts remain visible.</p>}
        </section>
      </div>

      <div className="catalog-view-toolbar">
        <div>
          <strong>{products.length} products</strong>
          <span> across {categories.length} systems</span>
        </div>
        <div className="catalog-view-switcher" aria-label="Catalog view">
          <button className={viewMode === "kanban" ? "is-active" : ""} onClick={() => setViewMode("kanban")} aria-label="Kanban view" title="Kanban view"><Columns3 size={17} /></button>
          <button className={viewMode === "grid" ? "is-active" : ""} onClick={() => setViewMode("grid")} aria-label="Grid view" title="Grid view"><Grid3X3 size={17} /></button>
          <button className={viewMode === "list" ? "is-active" : ""} onClick={() => setViewMode("list")} aria-label="List view" title="List view"><List size={17} /></button>
        </div>
      </div>

      <div className={`catalog-kanban catalog-view-${viewMode}`} aria-label="Parts categories">
        {categories.map((category) => {
          const Icon = category.icon;
          const categoryProducts = products
            .filter((product) => product.category === category.name)
            .sort((a, b) => Number(isCompatible(b)) - Number(isCompatible(a)));

          return (
            <section className="catalog-column" key={category.name}>
              <header className="catalog-column-header">
                <span className="catalog-category-logo" aria-hidden="true">
                  <Icon size={24} strokeWidth={1.6} />
                </span>
                <div>
                  <h2>{category.name}</h2>
                  <p>{categoryProducts.length} available</p>
                </div>
              </header>
              <div className="catalog-column-products">
                {categoryProducts.length ? categoryProducts.map((product) => {
                  const compatible = isCompatible(product);
                  return (
                    <article className="catalog-product-card" key={product.id}>
                      <button
                        className="catalog-product-open"
                        onClick={() => openProduct(product)}
                      >
                        <img src={product.image} alt="" width={64} height={64} />
                        <span className="catalog-product-copy">
                          <small>{product.brand}</small>
                          <strong>{product.name}</strong>
                          <span>Part {product.partNumber}</span>
                        </span>
                      </button>
                      <dl className="catalog-product-details">
                        <div><dt>OE</dt><dd>{product.oe[0]}</dd></div>
                        <div><dt>Warehouse</dt><dd>{product.warehouse}</dd></div>
                        <div><dt>Fits</dt><dd>{product.fitment.slice(0, 2).join(", ")}</dd></div>
                      </dl>
                      <div className="catalog-product-meta">
                        <span className={compatible ? "is-compatible" : ""}>
                          {compatible ? "Matches vehicle" : productAvailability(product)}
                        </span>
                        <strong>{productPrice(product, market)}</strong>
                      </div>
                      {product.verified && product.source ? (
                        <a className="catalog-add" href={product.source} target="_blank" rel="noreferrer">
                          <Check size={15} /> Verified source
                        </a>
                      ) : (
                        <button className="catalog-add" onClick={() => addToCart(product)}>
                          <Plus size={15} /> Add
                        </button>
                      )}
                    </article>
                  );
                }) : (
                  <div className="catalog-empty-column">
                    <PackageCheck size={24} strokeWidth={1.5} />
                    <p>No listed products yet</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

function ResultsView({
  query,
  results,
  setView,
  openProduct,
  addToCart,
  market,
}: {
  query: string;
  results: Product[];
  setView: (v: View) => void;
  openProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
  market: Market;
}) {
  return (
    <main className="mx-auto max-w-[1320px] px-4 py-10 md:px-8 md:py-16">
      <button
        onClick={() => setView("home")}
        className="mb-10 flex items-center gap-2 text-sm font-medium text-[#777873] hover:text-[#20211f]"
      >
        <ArrowLeft size={16} /> Back to catalogue
      </button>
      <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#e4e4e0] pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a8b87]">Catalogue</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-.035em] md:text-5xl">
            {query ? `Results for “${query}”` : "All parts"}
          </h1>
          <p className="mt-3 text-sm text-[#777873]">
            {results.length} compatible or cross-referenced{" "}
            {results.length === 1 ? "item" : "items"}
          </p>
        </div>
        <Button variant="outline" className="rounded-md border-[#d8d8d4] bg-white">
          <Filter /> Filters
        </Button>
      </div>
      {results.length === 0 ? (
        <div className="grid min-h-[360px] place-items-center border-y border-[#e4e4e0] text-center">
          <div>
            <h2 className="text-xl font-semibold">No match found</h2>
            <p className="mt-2 text-[#777873]">
              Try a shorter OE number, brand, category or truck model.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <article
                key={p.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-[20px] border border-[#e2e2de] bg-white p-5 shadow-[0_12px_35px_rgba(20,20,18,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(20,20,18,.1)]"
              >
                <button onClick={() => openProduct(p)} className="group relative overflow-hidden rounded-xl bg-[#f2f2ef]">
                  <img src={p.image} alt={p.name} className="h-52 w-full object-contain p-5 mix-blend-multiply transition duration-300 group-hover:scale-[1.035]" />
                  {p.verified && <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[.1em] shadow-sm">Verified</span>}
                </button>
                <button onClick={() => openProduct(p)} className="mt-5 flex-1 text-left">
                  <p className="text-xs font-semibold uppercase tracking-[.08em] text-[#777873]">
                    {p.brand} · {p.category}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-.02em]">
                    {p.name}
                  </h2>
                  <p className="mt-2 font-mono text-xs text-[#777873]">
                    Part {p.partNumber} · OE {p.oe[0]}
                  </p>
                  <p className="mt-3 min-h-10 text-sm leading-5 text-[#5f605c]">
                    Fits {p.fitment.slice(0, 2).join(", ")}
                    {p.fitment.length > 2 ? ` +${p.fitment.length - 2}` : ""}
                  </p>
                </button>
                <div className="mt-5 flex items-end justify-between gap-4 border-t border-[#ecece8] pt-5">
                  <div>
                    <strong className="text-xl">
                      {productPrice(p, market)}
                    </strong>
                    <span className="block text-xs text-[#4d6755]">
                      {productAvailability(p)}
                    </span>
                  </div>
                  {p.verified && p.source ? (
                    <a href={p.source} target="_blank" rel="noreferrer" className="rounded-md bg-[#171816] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333431]">View source</a>
                  ) : (
                    <button onClick={() => addToCart(p)} className="rounded-md bg-[#171816] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#333431]">Add to cart</button>
                  )}
                </div>
              </article>
            ))}
        </div>
      )}
    </main>
  );
}

function ProductView({
  product,
  products,
  setView,
  openProduct,
  addToCart,
  market,
}: {
  product: Product;
  products: Product[];
  setView: (v: View) => void;
  openProduct: (p: Product) => void;
  addToCart: (p: Product) => void;
  market: Market;
}) {
  const alternatives = products.filter(
    (p) =>
      p.id !== product.id &&
      p.oe.some((oe) => product.oe.map(normalize).includes(normalize(oe))),
  );
  return (
    <main className="mx-auto max-w-[1120px] px-4 py-10 md:px-8 md:py-16">
      <button
        onClick={() => setView("results")}
        className="mb-10 flex items-center gap-2 text-sm font-medium text-[#777873] hover:text-[#20211f]"
      >
        <ArrowLeft size={16} /> Back to results
      </button>
      <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
        <ProductVisual
          category={product.category}
          image={product.image}
          alt={product.name}
          large
        />
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#171816]">{product.brand}</Badge>
            <Badge variant="outline">{product.category}</Badge>
          </div>
          <h1 className="mt-4 font-serif text-4xl tracking-[-.04em] md:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-md bg-[#f1f1ee] p-4 font-mono text-sm">
            <div>
              <span className="block font-sans text-xs text-slate-500">
                PART NUMBER
              </span>
              <strong>{product.partNumber}</strong>
            </div>
            <div>
              <span className="block font-sans text-xs text-slate-500">
                PRIMARY OE
              </span>
              <strong>{product.oe[0]}</strong>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between border-b border-slate-200 pb-6">
            <div>
              <span className="text-sm text-slate-500">
                Trade price, excl. VAT
              </span>
              <strong className="block text-4xl tracking-[-.04em]">
                {productPrice(product, market)}
              </strong>
            </div>
            <div className="text-right">
              <span className="font-bold text-emerald-700">
                {product.verified ? "Verified manufacturer record" : `● ${product.stock} in stock`}
              </span>
              <span className="block text-sm text-slate-500">
                {product.warehouse}
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            {product.verified && product.source ? (
              <a href={product.source} target="_blank" rel="noreferrer" className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-[#171816] text-base font-medium text-white hover:bg-[#333431]">
                <Check /> View verified source
              </a>
            ) : (
              <Button onClick={() => addToCart(product)} className="h-12 flex-1 rounded-md bg-[#171816] text-base hover:bg-[#333431]">
                <ShoppingCart /> Add to cart
              </Button>
            )}
            <Button variant="outline" className="h-12 px-5">
              RFQ
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-3 divide-x divide-[#e4e4e0] border-y border-[#e4e4e0] py-4 text-center text-xs font-medium text-[#696a66]">
            <div className="px-2">Verified fitment</div>
            <div className="px-2">UAE stock</div>
            <div className="px-2">RFQ ready</div>
          </div>
        </div>
      </div>
      <Tabs defaultValue="fitment" className="mt-12">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="fitment"
            className="rounded-none px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#20211f] data-[state=active]:shadow-none"
          >
            Vehicle fitment
          </TabsTrigger>
          <TabsTrigger
            value="cross"
            className="rounded-none px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#20211f] data-[state=active]:shadow-none"
          >
            OE cross-references
          </TabsTrigger>
          <TabsTrigger
            value="specs"
            className="rounded-none px-6 py-4 data-[state=active]:border-b-2 data-[state=active]:border-[#20211f] data-[state=active]:shadow-none"
          >
            Specifications
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="fitment"
          className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-6"
        >
          <h2 className="text-xl font-black">Compatible truck applications</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {product.fitment.map((fit) => (
              <div
                key={fit}
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#08bde8]">
                  <Truck size={20} />
                </span>
                <div>
                  <strong>{fit}</strong>
                  <span className="block text-sm text-slate-500">
                    Demo fitment · verify by VIN
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="cross"
          className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-6"
        >
          <h2 className="text-xl font-black">Matching OE references</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {product.oe.map((oe) => (
              <code
                key={oe}
                className="rounded-lg bg-slate-100 px-4 py-3 font-bold"
              >
                {oe}
              </code>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Search normalization ignores spaces, punctuation and a leading
            Mercedes “A”.
          </p>
        </TabsContent>
        <TabsContent
          value="specs"
          className="rounded-b-xl border border-t-0 border-slate-200 bg-white p-6"
        >
          <Table>
            <TableBody>
              {Object.entries(product.specs).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell className="font-semibold text-slate-500">
                    {key}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      <section className="mt-12">
        <h2 className="text-2xl font-black tracking-[-.03em]">
          Equivalent alternatives
        </h2>
        <p className="mt-1 text-slate-500">
          Products linked through the normalized OE cross-reference.
        </p>
        {alternatives.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {alternatives.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpen={() => openProduct(p)}
                market={market}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
            No alternate demo brand is linked to this OE number.
          </div>
        )}
      </section>
    </main>
  );
}

function AdminView({
  products,
  setProducts,
  setView,
  market,
}: {
  products: Product[];
  setProducts: (p: Product[]) => void;
  setView: (v: View) => void;
  market: Market;
}) {
  const [editing, setEditing] = useState<Product | null>(null);
  const save = () => {
    if (!editing) return;
    setProducts(products.map((p) => (p.id === editing.id ? editing : p)));
    setEditing(null);
    toast.success("Demo record updated");
  };
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      <button
        onClick={() => setView("home")}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-600"
      >
        <ArrowLeft size={16} /> Back to storefront
      </button>
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[#08bde8]">ADMIN DEMO</p>
          <h1 className="mt-1 text-4xl font-black tracking-[-.04em]">
            Catalogue data
          </h1>
          <p className="mt-2 text-slate-500">
            Edit seeded prices and stock. Changes stay in this browser session.
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info("CSV import is represented as a demo action.")
          }
          variant="outline"
        >
          <Plus /> Import demo CSV
        </Button>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Demo products"
          value={products.length.toString()}
          icon={Box}
        />
        <Metric
          label="Units in stock"
          value={products.reduce((s, p) => s + p.stock, 0).toString()}
          icon={PackageCheck}
        />
        <Metric
          label="Vehicle links"
          value={products.reduce((s, p) => s + p.fitment.length, 0).toString()}
          icon={Truck}
        />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <strong>Product records</strong>
          <div className="flex gap-2">
            <Input
              placeholder="Filter records"
              className="hidden w-56 md:block"
            />
            <Button variant="outline" size="icon">
              <SlidersHorizontal />
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>OE number</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex min-w-64 items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <strong className="block">{p.name}</strong>
                        <span className="font-mono text-xs text-slate-500">
                          {p.sku}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell className="font-mono">{p.oe[0]}</TableCell>
                  <TableCell>
                    <Badge variant={p.stock < 10 ? "destructive" : "secondary"}>
                      {p.stock}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">
                    {money(p.price, market)}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditing({ ...p })}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Edit demo inventory</DialogTitle>
                <DialogDescription>
                  {editing.brand} · {editing.partNumber}
                </DialogDescription>
              </DialogHeader>
              <label className="text-sm font-bold">
                Product name
                <Input
                  className="mt-1"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="text-sm font-bold">
                  Price (AED)
                  <Input
                    className="mt-1"
                    type="number"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                  />
                </label>
                <label className="text-sm font-bold">
                  Stock quantity
                  <Input
                    className="mt-1"
                    type="number"
                    value={editing.stock}
                    onChange={(e) =>
                      setEditing({ ...editing, stock: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <Button
                onClick={save}
                className="bg-[#171816] hover:bg-[#333431]"
              >
                Save record
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ProductCard({
  product,
  onOpen,
  market,
}: {
  product: Product;
  onOpen: () => void;
  market: Market;
}) {
  return (
    <button
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-[#e4e4e0] bg-white text-left transition duration-200 hover:border-[#bdbdb7]"
    >
      <ProductVisual
        category={product.category}
        image={product.image}
        alt={product.name}
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="rounded-md border-slate-200 bg-slate-50"
          >
            {product.brand}
          </Badge>
          <span className="text-xs font-bold text-emerald-700">
            {product.verified ? "Verified" : `● ${product.stock} in stock`}
          </span>
        </div>
        <h3 className="mt-4 text-xl font-semibold leading-tight tracking-[-.025em]">
          {product.name}
        </h3>
        <p className="mt-2 font-mono text-xs text-slate-500">
          {product.partNumber} · OE {product.oe[0]}
        </p>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <span className="block text-xs text-slate-500">Trade price</span>
            <strong className="text-2xl tabular-nums">
              {productPrice(product, market)}
            </strong>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-md bg-[#171816] text-white transition group-hover:bg-[#333431]">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </button>
  );
}
function ProductVisual({
  category,
  image,
  alt,
  compact = false,
  large = false,
}: {
  category: string;
  image?: string;
  alt?: string;
  compact?: boolean;
  large?: boolean;
}) {
  const Icon =
    category.includes("Brake") || category === "Braking"
      ? Disc3
      : category === "Filters"
        ? SlidersHorizontal
        : category === "Engine"
          ? Cog
          : category === "Electrical"
            ? CircleGauge
            : category === "Suspension"
              ? Gauge
              : Wrench;
  return (
    <div
      className={`group/image relative grid shrink-0 place-items-center overflow-hidden bg-[#f2f2ef] ${compact ? "h-16 w-16 rounded-md" : large ? "min-h-[360px] rounded-lg lg:min-h-[540px]" : "h-56 w-full rounded-t-lg"}`}
    >
      {image ? (
        <img
          src={image}
          alt={alt || `${category} truck part`}
          className={`h-full w-full object-cover transition duration-500 group-hover/image:scale-[1.035] ${compact ? "rounded-lg" : ""}`}
        />
      ) : (
        <Icon size={compact ? 22 : large ? 96 : 54} strokeWidth={1.4} />
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Box;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-[#08bde8]">
        <Icon />
      </span>
      <div>
        <strong className="block text-2xl">{value}</strong>
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
