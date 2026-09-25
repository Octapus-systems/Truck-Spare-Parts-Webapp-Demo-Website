"use client";

import { useState, type FormEvent } from "react";
import { ScanLine } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { findManufacturer, normalizeNumber } from "@/lib/tecdoc/normalize";
import type {
  TecdocArticle,
  TecdocCategory,
  TecdocManufacturer,
  TecdocModel,
  TecdocVehicle,
  VinResult,
} from "@/lib/tecdoc/types";
import { TecdocPartCard, type CatalogActions } from "./part-card";
import { fetchTecdoc, tecdocErrorMessage, useTecdoc, yearRange } from "./use-tecdoc";

const selectClass =
  "h-11 w-full min-w-0 rounded-md border border-[#d8d8d4] bg-white px-3 text-sm disabled:opacity-50";

const year = (date: string | null) => (date ? Number(date.slice(0, 4)) : null);

const coversYear = (model: TecdocModel, y: number) =>
  (year(model.from) ?? 0) <= y && y <= (year(model.to) ?? 9999);

const vehicleLabel = (v: TecdocVehicle) =>
  [v.engine, v.powerPs ? `${v.powerPs} PS` : null, v.bodyType, yearRange(v.from, v.to)].filter(Boolean).join(" · ");

const groupBy = <T,>(items: T[], key: (item: T) => string) =>
  items.reduce<Record<string, T[]>>((acc, item) => {
    (acc[key(item)] ??= []).push(item);
    return acc;
  }, {});

/** TecDoc vehicle lookup: VIN or make → model → vehicle → category → parts. */
export function TecdocVehicleFinder({ popularMakes, catalog }: { popularMakes: string[]; catalog: CatalogActions }) {
  const [manufacturerId, setManufacturerId] = useState<number | null>(null);
  const [modelId, setModelId] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [vinInput, setVinInput] = useState("");
  const [vin, setVin] = useState<VinResult | null>(null);
  const [vinState, setVinState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  const makes = useTecdoc<TecdocManufacturer[]>("manufacturers", {});
  const models = useTecdoc<TecdocModel[]>("models", manufacturerId ? { manufacturerId } : null);
  const vehicles = useTecdoc<TecdocVehicle[]>("vehicles", modelId ? { modelId } : null);
  const categories = useTecdoc<TecdocCategory[]>("categories", vehicleId ? { vehicleId } : null);
  const articles = useTecdoc<TecdocArticle[]>(
    "articles",
    vehicleId && categoryId ? { vehicleId, categoryId } : null,
  );

  if (makes.error === "not_configured") return null;

  const selectMake = (id: number | null) => {
    setManufacturerId(id);
    setModelId(null);
    setVehicleId(null);
    setCategoryId(null);
  };

  const decode = async (event: FormEvent) => {
    event.preventDefault();
    setVinState({ loading: true, error: null });
    try {
      const result = await fetchTecdoc<VinResult>("vin", { vin: vinInput.trim().toUpperCase() });
      setVin(result);
      selectMake(result.manufacturerId);
      setVinState({ loading: false, error: result.make ? null : "Could not identify this VIN." });
    } catch (error) {
      const code = (error as Error).message;
      setVinState({
        loading: false,
        error: code === "invalid_input" ? "Enter a 17-character VIN." : tecdocErrorMessage(code),
      });
    }
  };

  const popular = popularMakes
    .map((name) => findManufacturer(name, makes.data ?? []))
    .filter((m): m is TecdocManufacturer => !!m);
  const modelList =
    vin?.year && vin.manufacturerId === manufacturerId
      ? (models.data ?? []).filter((m) => coversYear(m, vin.year!))
      : (models.data ?? []);
  const vinModel = vin?.model && vin.manufacturerId === manufacturerId ? normalizeNumber(vin.model) : null;
  const vehicleList = [...(vehicles.data ?? [])].sort((a, b) => {
    const aHit = vinModel && normalizeNumber(a.engine).includes(vinModel) ? 0 : 1;
    const bHit = vinModel && normalizeNumber(b.engine).includes(vinModel) ? 0 : 1;
    return aHit - bHit || a.engine.localeCompare(b.engine);
  });
  const categoryGroups = groupBy(categories.data ?? [], (c) => c.group);
  const error = [makes, models, vehicles, categories, articles].find((r) => r.error)?.error;
  const loading = [makes, models, vehicles, categories, articles].some((r) => r.loading);

  return (
    <section className="catalog-compatibility" aria-label="TecDoc vehicle lookup">
      <div className="catalog-compatibility-title">
        <span className="catalog-category-logo"><ScanLine size={22} strokeWidth={1.7} /></span>
        <span>
          <strong>Find genuine fitment</strong>
          <small>TecDoc lookup by VIN or by vehicle, then choose a part group</small>
        </span>
      </div>

      <form onSubmit={decode} className="mt-4 flex gap-2">
        <input
          value={vinInput}
          onChange={(event) => setVinInput(event.target.value)}
          placeholder="VIN, e.g. WDB9340321L123456"
          aria-label="Vehicle identification number"
          maxLength={17}
          className={`${selectClass} font-mono uppercase`}
        />
        <button disabled={vinInput.trim().length !== 17 || vinState.loading} className="h-11 shrink-0 rounded-md bg-[#171816] px-4 text-sm font-semibold text-white disabled:opacity-50">
          {vinState.loading ? <Spinner /> : "Decode"}
        </button>
      </form>
      {vin?.make && (
        <p className="catalog-compatibility-result">
          VIN: {vin.make} {vin.model} {vin.year ? `(${vin.year})` : ""}
          {vin.bodyStyle ? ` · ${vin.bodyStyle}` : ""}. Choose the model below.
        </p>
      )}
      {vinState.error && <p className="mt-2 text-sm text-amber-800">{vinState.error}</p>}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select aria-label="TecDoc make" className={selectClass} value={manufacturerId ?? ""} onChange={(e) => selectMake(e.target.value ? Number(e.target.value) : null)}>
          <option value="">{makes.loading ? "Loading makes…" : "Make"}</option>
          {popular.length > 0 && (
            <optgroup label="Popular">
              {popular.map((m) => <option key={`p${m.id}`} value={m.id}>{m.name}</option>)}
            </optgroup>
          )}
          <optgroup label="All makes">
            {(makes.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </optgroup>
        </select>
        <select aria-label="TecDoc model" className={selectClass} disabled={!models.data} value={modelId ?? ""} onChange={(e) => { setModelId(e.target.value ? Number(e.target.value) : null); setVehicleId(null); setCategoryId(null); }}>
          <option value="">{models.loading ? "Loading models…" : "Model"}</option>
          {modelList.map((m) => <option key={m.modelId} value={m.modelId}>{m.name} ({yearRange(m.from, m.to)})</option>)}
        </select>
        <select aria-label="TecDoc vehicle" className={selectClass} disabled={!vehicles.data} value={vehicleId ?? ""} onChange={(e) => { setVehicleId(e.target.value ? Number(e.target.value) : null); setCategoryId(null); }}>
          <option value="">{vehicles.loading ? "Loading vehicles…" : `Vehicle${vehicles.data ? ` (${vehicles.data.length})` : ""}`}</option>
          {vehicleList.map((v) => <option key={v.vehicleId} value={v.vehicleId}>{vehicleLabel(v)}</option>)}
        </select>
        <select aria-label="TecDoc part group" className={selectClass} disabled={!categories.data} value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}>
          <option value="">{categories.loading ? "Loading part groups…" : "Part group"}</option>
          {Object.entries(categoryGroups).map(([group, items]) => (
            <optgroup key={group} label={group}>
              {items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {loading && !makes.loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#777873]"><Spinner /> Loading from TecDoc…</p>
      )}
      {error && error !== "not_configured" && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{tecdocErrorMessage(error)}</p>
      )}
      {articles.data && (
        articles.data.length ? (
          <>
            <p className="mt-5 text-sm text-[#777873]">{articles.data.length} parts fit this vehicle</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {articles.data.map((article) => (
                <TecdocPartCard key={article.key} article={article} catalog={catalog} />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-[#777873]">TecDoc lists no parts in this group for this vehicle.</p>
        )
      )}
    </section>
  );
}
