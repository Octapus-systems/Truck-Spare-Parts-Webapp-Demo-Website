"use client";

import { ArrowRight, BadgeCheck, CircleGauge, Cog, Disc3, Gauge, PackageCheck, Search, Settings2, SlidersHorizontal, Truck, Warehouse, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TecdocVehicleFinder } from "@/components/tecdoc/vehicle-finder";
import { trucks } from "@/data/products";
import { strings } from "@/lib/shop/i18n";
import { productPrice } from "@/lib/shop/market";
import { useAppState, useCatalog } from "@/lib/store/store";
import { saveVehicle } from "@/lib/store/garage";
import { update } from "@/lib/store/store";
import { vehicleParams } from "./garage";
import { CountUp, Reveal } from "./motion";
import { addProductToCart, ProductCard } from "./product-card";
import { partFromArticle, useQuote } from "./quote-dialog";
import { SearchBox } from "./search-box";

const POPULAR = ["9424212112", "2927801", "Brake disc", "Air filter", "MAN TGX"];

const CATEGORIES = [
  { name: "Braking", icon: Disc3, blurb: "Discs, pads, calipers" },
  { name: "Engine", icon: Cog, blurb: "Belts, tensioners, seals" },
  { name: "Filters", icon: SlidersHorizontal, blurb: "Oil, fuel, air" },
  { name: "Suspension", icon: Gauge, blurb: "Torque rods, bushes" },
  { name: "Electrical", icon: CircleGauge, blurb: "Sensors, switches" },
  { name: "Air & Brake", icon: Settings2, blurb: "Valves, dryers, compressors" },
];

const STEPS = [
  { icon: Search, title: "Search", body: "Part number, OE number, description or vehicle." },
  { icon: BadgeCheck, title: "Verify fitment", body: "TecDoc vehicle data and cross-references per part." },
  { icon: PackageCheck, title: "Order", body: "Check out in a minute. Pickup or delivery across the UAE." },
  { icon: Zap, title: "Invoice", body: "Our counter confirms stock and issues a VAT invoice in AED." },
];

export function HomePage() {
  const { prefs } = useAppState();
  const products = useCatalog();
  const t = strings(prefs.locale);
  const router = useRouter();
  const openQuote = useQuote();

  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const unitsInStock = products.reduce((sum, p) => sum + Math.max(p.stock, 0), 0);
  const featured = products.filter((p) => p.featured || p.stock > 0).slice(0, 8);

  const catalog = {
    products,
    openProduct: (p: { id: string }) => router.push(`/parts/${p.id}`),
    addToCart: (p: (typeof products)[number]) => addProductToCart(p),
    priceLabel: (p: (typeof products)[number]) => productPrice(p, prefs.market),
    requestQuote: (a: Parameters<typeof partFromArticle>[0]) => openQuote(partFromArticle(a)),
  };

  return (
    <>
      {/* Hero */}
      <section className="s-hero relative overflow-hidden">
        <div className="s-grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="s-container relative grid gap-10 py-14 md:py-20 lg:grid-cols-[1.25fr_.75fr] lg:items-center lg:gap-14">
          <div>
            <p className="s-badge" data-tone="neutral">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--s-green)]" aria-hidden="true" />
              {t.heroEyebrow}
            </p>
            <h1 className="mt-5 max-w-[14ch] text-[clamp(38px,5.6vw,64px)] font-semibold leading-[1.02] tracking-[-.04em]">{t.heroTitle}</h1>
            <p className="mt-5 max-w-[56ch] text-[17px] leading-7 text-[var(--s-text-2)]">{t.heroBody}</p>
            <div className="mt-8 max-w-[640px]">
              <SearchBox size="lg" placeholder={t.searchPlaceholder} buttonLabel={t.search} />
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
                <span className="text-[var(--s-muted)]">{t.popular}:</span>
                {POPULAR.map((q) => (
                  <Link key={q} href={`/parts?q=${encodeURIComponent(q)}`} className="mono rounded-full border border-[var(--s-line)] bg-white px-3 py-1 text-[12.5px] text-[var(--s-text-2)] hover:border-[var(--s-text)] hover:text-[var(--s-text)]">
                    {q}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <VehicleCard />
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Why Desert Route" className="border-b border-[var(--s-line)]">
        <div className="s-container grid grid-cols-2 divide-[var(--s-line)] md:grid-cols-4 md:divide-x">
          <Stat icon={BadgeCheck} value={<><CountUp value={brands.length} />+</>} label="OE-quality brands" />
          <Stat icon={PackageCheck} value={<CountUp value={unitsInStock} />} label="Units in stock now" />
          <Stat icon={Warehouse} value={<CountUp value={new Set(products.map((p) => p.warehouse)).size} />} label="UAE warehouses" />
          <Stat icon={Truck} value="Same day" label="Dispatch before 2 pm" />
        </div>
      </section>

      {/* Categories */}
      <Reveal>
        <section className="s-container mt-20">
          <SectionHead eyebrow="Browse" title="Shop by system" link={{ href: "/parts", label: "All parts" }} />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map(({ name, icon: Icon, blurb }) => {
              const count = products.filter((p) => p.category === name).length;
              return (
                <Link key={name} href={`/parts?category=${encodeURIComponent(name)}`} className="s-card group p-5" data-hover>
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--s-surface)] text-[var(--s-text)] transition-colors group-hover:bg-[var(--s-dark)] group-hover:text-white">
                    <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-[15px] font-semibold">{name}</p>
                  <p className="mt-0.5 text-[13px] text-[var(--s-muted)]">{blurb}</p>
                  <p className="tnum mt-3 text-[12px] font-medium text-[var(--s-text-2)]">{count} parts</p>
                </Link>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* Featured */}
      <Reveal>
        <section className="s-container mt-20">
          <SectionHead eyebrow="In stock" title="Frequently ordered" link={{ href: "/parts?stock=1", label: "View all in stock" }} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* TecDoc vehicle finder */}
      <section id="vehicles" className="mt-20 scroll-mt-20 border-y border-[var(--s-line)] bg-[var(--s-surface)] py-16">
        <div className="s-container">
          <SectionHead eyebrow="TecDoc catalogue" title="Find parts by exact vehicle or VIN" />
          <p className="mt-3 max-w-2xl text-[15px] text-[var(--s-text-2)]">
            Pick make, model and engine variant — or decode a VIN — to see TecDoc parts for that exact truck. Parts we stock show live price and availability.
          </p>
          <div className="s-card mt-8 p-4 md:p-6">
            <TecdocVehicleFinder popularMakes={[...new Set(trucks.map((tr) => tr[0]))]} catalog={catalog} />
          </div>
        </div>
      </section>

      {/* Brands */}
      <Reveal>
        <section id="brands" className="s-container mt-20 scroll-mt-20">
          <SectionHead eyebrow="Brands" title="Stocked brands" />
          <ul className="mt-8 grid grid-cols-2 overflow-hidden rounded-xl border-s border-t border-[var(--s-line)] sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <li key={brand} className="border-b border-e border-[var(--s-line)]">
                <Link href={`/parts?brand=${encodeURIComponent(brand)}`} className="flex h-20 items-center justify-center bg-white px-3 text-center text-[15px] font-semibold tracking-[-.01em] text-[var(--s-text-2)] hover:text-[var(--s-text)]">
                  {brand}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <section id="how" className="s-container mt-20 scroll-mt-20">
          <SectionHead eyebrow="How it works" title="From part number to invoice" />
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="s-card p-5">
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--s-accent-soft)] text-[var(--s-accent)]">
                    <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <span className="mono text-[12px] text-[var(--s-muted)]">0{i + 1}</span>
                </div>
                <p className="mt-4 text-[15px] font-semibold">{title}</p>
                <p className="mt-1 text-[14px] leading-6 text-[var(--s-text-2)]">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      {/* Trade CTA */}
      <Reveal>
        <section className="s-container mt-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-[var(--s-dark)] px-6 py-10 text-white md:flex-row md:items-center md:px-10">
            <div>
              <p className="text-[22px] font-semibold tracking-[-.02em]">Running a fleet or workshop?</p>
              <p className="mt-2 max-w-xl text-[15px] text-white/70">Add your TRN at checkout for VAT invoices. Our counter team confirms stock and fitment on every order.</p>
            </div>
            <Link href="/parts" className="s-btn shrink-0 bg-white text-[var(--s-text)] hover:bg-white/90" data-size="lg">
              Start searching <ArrowRight size={16} className="rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}

function VehicleCard() {
  const router = useRouter();
  const { prefs } = useAppState();
  const t = strings(prefs.locale);
  const [make, setMake] = useState("");
  const [series, setSeries] = useState("");
  const [year, setYear] = useState("");
  const [save, setSave] = useState(true);

  const makes = trucks.map((tr) => tr[0]);
  const truck = trucks.find((tr) => tr[0] === make);
  const seriesOptions = truck ? truck[1].split(" / ").map((s) => s.trim()) : [];
  const [from, to] = truck ? truck[2].split("–").map(Number) : [2010, 2024];
  const years = Array.from({ length: to - from + 1 }, (_, i) => String(to - i));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!make) return;
    if (save) update((s) => saveVehicle(s, { make, series, year, nickname: "" }));
    router.push(`/parts?${vehicleParams({ make, series, year })}`);
  };

  return (
    <form onSubmit={submit} className="s-card p-6 shadow-[0_24px_60px_rgba(15,17,21,.08)]" aria-label={t.vehicleTitle}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--s-dark)] text-white">
          <Truck size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[16px] font-semibold">{t.vehicleTitle}</p>
          <p className="text-[13px] text-[var(--s-muted)]">{t.vehicleBody}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <label>
          <span className="s-label">{t.make}</span>
          <select className="s-select" value={make} onChange={(e) => { setMake(e.target.value); setSeries(""); setYear(""); }} required>
            <option value="">Select make</option>
            {makes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3">
          <label>
            <span className="s-label">{t.model}</span>
            <select className="s-select" value={series} onChange={(e) => setSeries(e.target.value)} disabled={!make}>
              <option value="">All series</option>
              {seriesOptions.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="s-label">{t.year}</span>
            <select className="s-select" value={year} onChange={(e) => setYear(e.target.value)} disabled={!make}>
              <option value="">Any</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--s-text-2)]">
          <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-4 w-4 accent-[var(--s-text)]" />
          Save to My Garage — mark parts that fit
        </label>
        <button type="submit" className="s-btn w-full" data-variant="accent" data-size="lg" disabled={!make}>
          {t.findParts} <ArrowRight size={16} className="rtl:rotate-180" />
        </button>
        <Link href="/#vehicles" className="text-center text-[13px] font-medium text-[var(--s-accent)] hover:underline">
          Exact engine variant or VIN? Use the TecDoc finder ↓
        </Link>
      </div>
    </form>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Truck; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-6 md:px-6">
      <Icon size={22} strokeWidth={1.6} className="shrink-0 text-[var(--s-accent)]" aria-hidden="true" />
      <div>
        <p className="tnum text-[20px] font-semibold tracking-[-.02em]">{value}</p>
        <p className="text-[13px] text-[var(--s-muted)]">{label}</p>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="s-eyebrow">{eyebrow}</p>
        <h2 className="s-h2 mt-2">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="hidden shrink-0 items-center gap-1 text-[14px] font-medium text-[var(--s-text-2)] hover:text-[var(--s-text)] sm:flex">
          {link.label} <ArrowRight size={15} className="rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}
