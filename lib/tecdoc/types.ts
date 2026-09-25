// Normalised TecDoc shapes returned by /api/tecdoc. Raw RapidAPI payloads are
// mapped into these in normalize.ts so the UI never depends on vendor fields.

export type TecdocManufacturer = { id: number; name: string };

export type TecdocModel = {
  modelId: number;
  name: string;
  from: string | null;
  to: string | null;
};

export type TecdocVehicle = {
  vehicleId: number;
  manufacturer: string;
  model: string;
  engine: string;
  bodyType: string | null;
  from: string | null;
  to: string | null;
  powerPs: number | null;
  tonnage: number | null;
  engineCodes: string[];
};

export type TecdocCategory = { id: number; name: string; group: string };

export type TecdocArticle = {
  key: string;
  articleId: number | null;
  articleNo: string;
  supplierName: string;
  productName: string | null;
  image: string | null;
  /** OE number that led to this article (OE search only). */
  oeMatch: { brand: string; number: string } | null;
};

export type TecdocArticleDetail = {
  article: TecdocArticle;
  specs: { name: string; value: string }[];
  oemNumbers: { brand: string; number: string }[];
};

export type FitmentVariant = {
  engine: string;
  bodyType: string | null;
  axle: string | null;
  powerPs: number | null;
  from: string | null;
  to: string | null;
};

export type FitmentGroup = {
  manufacturer: string;
  model: string;
  from: string | null;
  to: string | null;
  /** Capped sample; see variantCount for the total. */
  variants: FitmentVariant[];
  variantCount: number;
};

export type VinResult = {
  vin: string;
  make: string | null;
  model: string | null;
  year: number | null;
  bodyStyle: string | null;
  engine: string | null;
  manufacturerId: number | null;
};
