// Cached TecDoc lookups. Each function caches its normalised (small) result,
// not the raw payload, which can be several MB.
import { unstable_cache } from "next/cache";
import { apiprofileGet, isApiprofileConfigured, isRapidapiConfigured, tecdocGet } from "./client";
import { CACHE_SECONDS, COUNTRY_ID, LANG_ID, TYPE_ID } from "./config";
import {
  findManufacturer,
  normalizeNumber,
  parseArticleDetail,
  parseArticles,
  parseCategories,
  parseFitment,
  parseManufacturers,
  parseModels,
  parseVehicles,
  parseVin,
} from "./normalize";
import type { TecdocArticle, VinResult } from "./types";

const cached = <Args extends unknown[], R>(name: string, fn: (...args: Args) => Promise<R>) =>
  unstable_cache(fn, ["tecdoc", name], { revalidate: CACHE_SECONDS, tags: ["tecdoc"] });

const enc = encodeURIComponent;
const SEARCH_LIMIT = 60;

export const getManufacturers = cached("manufacturers", async () =>
  parseManufacturers(await tecdocGet(`/manufacturers/list/type-id/${TYPE_ID}`)),
);

export const getModels = cached("models", async (manufacturerId: number) =>
  parseModels(
    await tecdocGet(
      `/models/list/type-id/${TYPE_ID}/manufacturer-id/${manufacturerId}/lang-id/${LANG_ID}/country-filter-id/${COUNTRY_ID}`,
    ),
  ),
);

export const getVehicles = cached("vehicles", async (modelId: number) =>
  parseVehicles(
    await tecdocGet(
      `/types/type-id/${TYPE_ID}/list-vehicles-types/${modelId}/lang-id/${LANG_ID}/country-filter-id/${COUNTRY_ID}`,
    ),
  ),
);

export const getCategories = cached("categories", async (vehicleId: number) =>
  parseCategories(
    await tecdocGet(`/category/type-id/${TYPE_ID}/products-groups-variant-3/${vehicleId}/lang-id/${LANG_ID}`),
  ),
);

export const getArticles = cached("articles", async (vehicleId: number, categoryId: number) =>
  parseArticles(
    await tecdocGet(
      `/articles/list/type-id/${TYPE_ID}/vehicle-id/${vehicleId}/category-id/${categoryId}/lang-id/${LANG_ID}`,
    ),
  ),
);

export const getArticleDetail = cached("detail", async (articleId: number) =>
  parseArticleDetail(await tecdocGet(`/articles/details/article-id/${articleId}/lang-id/${LANG_ID}`)),
);

const searchByArticleNo = cached("search-no", async (query: string) =>
  parseArticles(
    await tecdocGet(
      `/artlookup/search-for-analog-spare-parts-by-the-articles-numbers/lang-id/${LANG_ID}/articleNo/${enc(query)}`,
    ),
  ).slice(0, SEARCH_LIMIT),
);

const searchByOem = cached("search-oem", async (query: string) =>
  parseArticles(
    await tecdocGet(`/artlookup/search-for-analogue-of-spare-parts-by-oem-number/article-oem-no/${enc(normalizeNumber(query))}`),
  ).slice(0, SEARCH_LIMIT),
);

/** apiprofile.com article lookup. `articleType` picks how articleNo is matched. */
type ApiprofileSearchType = "ArticleNumber" | "OENumber" | "IAMNumber";

const searchApiprofile = cached("apiprofile-search", async (articleType: ApiprofileSearchType, query: string) =>
  parseArticles(
    await apiprofileGet("/artlookup/search-articles-by-article-no", {
      langId: LANG_ID,
      articleType,
      articleNo: query,
    }),
    { oeSearch: articleType === "OENumber" },
  ).slice(0, SEARCH_LIMIT),
);

/**
 * Lookups run in parallel and merge in priority order; one failing side doesn't
 * sink the rest. apiprofile is used when configured: exact article number, then
 * OE number, then aftermarket (IAM) cross-references. RapidAPI otherwise, or
 * when every apiprofile lookup fails (e.g. monthly quota used up).
 */
export async function searchByNumber(query: string): Promise<TecdocArticle[]> {
  if (isApiprofileConfigured()) {
    try {
      return await mergeLookups([
        searchApiprofile("ArticleNumber", query),
        searchApiprofile("OENumber", query),
        searchApiprofile("IAMNumber", query),
      ]);
    } catch (error) {
      // e.g. monthly quota used up: fall back to RapidAPI when it is set up.
      if (!isRapidapiConfigured()) throw error;
    }
  }
  return mergeLookups([searchByOem(query), searchByArticleNo(query)]);
}

async function mergeLookups(lookups: Promise<TecdocArticle[]>[]): Promise<TecdocArticle[]> {
  const results = await Promise.allSettled(lookups);
  const failed = results.find((r) => r.status === "rejected");
  if (failed && results.every((r) => r.status === "rejected")) throw failed.reason;
  const merged = new Map<string, TecdocArticle>();
  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const article of result.value) if (!merged.has(article.key)) merged.set(article.key, article);
    }
  }
  return [...merged.values()].slice(0, SEARCH_LIMIT);
}

export const getFitmentByOe = cached("fitment-v2", async (manufacturerId: number, oe: string) =>
  parseFitment(
    await tecdocGet(
      `/articles-oem/selecting-a-list-of-cars-for-oem-part-number/type-id/${TYPE_ID}/lang-id/${LANG_ID}/country-filter-id/${COUNTRY_ID}/manufacturer-id/${manufacturerId}/article-oem-no/${enc(normalizeNumber(oe))}`,
    ),
  ),
);

export async function resolveManufacturerId(make: string): Promise<number | null> {
  return findManufacturer(make, await getManufacturers())?.id ?? null;
}

export const decodeVin = cached("vin", async (vin: string): Promise<VinResult> => {
  // v3 has model/body details; only spend a second request on v1 if v3 has no make.
  const v3 = await tecdocGet(`/vin/decoder-v3/${enc(vin)}`).catch(() => null);
  let decoded = parseVin(vin, v3);
  if (!decoded.make) decoded = parseVin(vin, v3, await tecdocGet(`/vin/decoder-v1/${enc(vin)}`));
  return {
    ...decoded,
    manufacturerId: decoded.make ? await resolveManufacturerId(decoded.make) : null,
  };
});
