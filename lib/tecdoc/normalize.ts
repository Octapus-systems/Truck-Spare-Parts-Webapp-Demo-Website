// Pure mappers from raw RapidAPI TecDoc payloads to the types in types.ts.
// Only type imports here, so tests can load this file directly with Node.
import type {
  FitmentGroup,
  TecdocArticle,
  TecdocArticleDetail,
  TecdocCategory,
  TecdocManufacturer,
  TecdocModel,
  TecdocVehicle,
  VinResult,
} from "./types";

type Raw = Record<string, unknown>;

const obj = (value: unknown): Raw =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Raw) : {};
const arr = (value: unknown): Raw[] => (Array.isArray(value) ? value.map(obj) : []);
const str = (value: unknown): string | null => {
  if (typeof value === "number") return String(value);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};
const num = (value: unknown): number | null => {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : null;
};

export const normalizeNumber = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "");

export function parseManufacturers(raw: unknown): TecdocManufacturer[] {
  return arr(obj(raw).manufacturers)
    .map((m) => ({ id: num(m.manufacturerId), name: str(m.manufacturerName) }))
    .filter((m): m is TecdocManufacturer => m.id !== null && m.name !== null);
}

export function parseModels(raw: unknown): TecdocModel[] {
  return arr(obj(raw).models)
    .map((m) => ({
      modelId: num(m.modelId),
      name: str(m.modelName),
      from: str(m.modelYearFrom),
      to: str(m.modelYearTo),
    }))
    .filter((m): m is TecdocModel => m.modelId !== null && m.name !== null);
}

/** One row per engine code upstream; merge them into one entry per vehicleId. */
export function parseVehicles(raw: unknown): TecdocVehicle[] {
  const byId = new Map<number, TecdocVehicle>();
  for (const v of arr(obj(raw).modelTypes)) {
    const vehicleId = num(v.vehicleId);
    if (vehicleId === null) continue;
    const code = str(v.engineCodes);
    const existing = byId.get(vehicleId);
    if (existing) {
      if (code && !existing.engineCodes.includes(code)) existing.engineCodes.push(code);
      continue;
    }
    byId.set(vehicleId, {
      vehicleId,
      manufacturer: str(v.manufacturerName) ?? "",
      model: str(v.modelName) ?? "",
      engine: str(v.typeEngineName) ?? "",
      bodyType: str(v.bodyType),
      from: str(v.constructionIntervalStart),
      to: str(v.constructionIntervalEnd),
      powerPs: num(v.powerPsStart),
      tonnage: num(v.tonnage),
      engineCodes: code ? [code] : [],
    });
  }
  return [...byId.values()];
}

const SKIPPED_CATEGORY = "Article Search via Graphic";

/** Flattens the category tree to its leaves, labelled by top-level group. */
export function parseCategories(raw: unknown): TecdocCategory[] {
  const leaves: TecdocCategory[] = [];
  const walk = (nodes: Raw, group: string | null) => {
    for (const [id, node] of Object.entries(nodes)) {
      const n = obj(node);
      const name = str(n.text);
      if (!name || name === SKIPPED_CATEGORY) continue;
      const children = obj(n.children);
      if (Object.keys(children).length) walk(children, group ?? name);
      else leaves.push({ id: Number(id), name, group: group ?? name });
    }
  };
  walk(obj(obj(raw).categories), null);
  return leaves.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}

function toArticle(a: Raw): TecdocArticle | null {
  const articleNo = str(a.articleNo);
  const supplierName = str(a.supplierName);
  if (!articleNo || !supplierName) return null;
  const oeNumber = str(a.crossNumber);
  return {
    key: `${normalizeNumber(supplierName)}:${normalizeNumber(articleNo)}`,
    articleId: num(a.articleId),
    articleNo,
    supplierName,
    productName: str(a.articleProductName),
    image: str(a.s3image),
    oeMatch: oeNumber
      ? { brand: str(a.crossManufacturerName) ?? "", number: oeNumber }
      : null,
  };
}

/** Works for article lists, article-number search and OE search payloads. */
export function parseArticles(raw: unknown): TecdocArticle[] {
  const seen = new Set<string>();
  const out: TecdocArticle[] = [];
  for (const item of arr(obj(raw).articles)) {
    const article = toArticle(item);
    if (!article || seen.has(article.key)) continue;
    seen.add(article.key);
    out.push(article);
  }
  return out;
}

export function parseArticleDetail(raw: unknown): TecdocArticleDetail | null {
  const root = obj(raw);
  const article = toArticle(obj(root.article));
  if (!article) return null;
  return {
    article,
    specs: arr(root.articleAllSpecifications)
      .map((s) => ({ name: str(s.criteriaName), value: str(s.criteriaValue) }))
      .filter((s): s is { name: string; value: string } => !!s.name && !!s.value),
    oemNumbers: arr(root.articleOemNo)
      .map((o) => ({ brand: str(o.oemBrand), number: str(o.oemDisplayNo) }))
      .filter((o): o is { brand: string; number: string } => !!o.brand && !!o.number),
  };
}

const MAX_VARIANTS_PER_GROUP = 30;

/** Groups the per-variant OE fitment list by model series. */
export function parseFitment(raw: unknown): FitmentGroup[] {
  const groups = new Map<string, FitmentGroup>();
  const seen = new Set<string>();
  for (const v of arr(raw)) {
    const manufacturer = str(v.manufacturerName) ?? "";
    const model = str(v.modelType);
    const engine = str(v.typeEngineName);
    if (!model || !engine) continue;
    const variant = {
      engine,
      bodyType: str(v.bodyType),
      axle: str(v.axleConfiguration),
      powerPs: num(v.powerPsStart),
      from: str(v.constructionIntervalStart),
      to: str(v.constructionIntervalEnd),
    };
    const variantKey = [model, engine, variant.bodyType, variant.axle, variant.from].join("|");
    if (seen.has(variantKey)) continue;
    seen.add(variantKey);
    const groupKey = `${manufacturer}|${model}`;
    const group = groups.get(groupKey) ?? {
      manufacturer,
      model,
      from: variant.from,
      to: variant.to,
      variants: [],
      variantCount: 0,
    };
    if (variant.from && (!group.from || variant.from < group.from)) group.from = variant.from;
    if (!variant.to || (group.to && variant.to > group.to)) group.to = variant.to;
    group.variantCount += 1;
    if (group.variants.length < MAX_VARIANTS_PER_GROUP) group.variants.push(variant);
    groups.set(groupKey, group);
  }
  return [...groups.values()];
}

/** decoder-v3 returns titled sections; decoder-v1 is the fallback. */
export function parseVin(vin: string, v3: unknown, v1?: unknown): Omit<VinResult, "manufacturerId"> {
  const sections = arr(v3);
  const general = obj(sections.find((s) => str(s.title) === "General information")?.information);
  const fallback = obj(v1);
  const v1Years = Array.isArray(fallback.modelYear) ? fallback.modelYear : [];
  return {
    vin,
    make: str(general.Make) ?? str(fallback.manufacturer),
    model: str(general.Model),
    year: num(general["Model year"]) ?? num(v1Years[0]),
    bodyStyle: str(general["Body style"]),
    engine: str(general["Engine type"]),
  };
}

/** Finds a TecDoc manufacturer for a free-text make ("Mercedes-Benz", "Renault Trucks"). */
export function findManufacturer(
  make: string,
  manufacturers: TecdocManufacturer[],
): TecdocManufacturer | null {
  const key = normalizeNumber(make);
  if (!key) return null;
  return (
    manufacturers.find((m) => normalizeNumber(m.name) === key) ??
    manufacturers.find((m) => key.startsWith(normalizeNumber(m.name))) ??
    manufacturers.find((m) => normalizeNumber(m.name).startsWith(key)) ??
    null
  );
}
