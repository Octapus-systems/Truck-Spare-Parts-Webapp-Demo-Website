// TecDoc lookup IDs, confirmed against the live API on 2026-09-25.
export const TECDOC_HOST = "auto-parts-catalog.p.rapidapi.com";
/** Same TecDoc catalogue via apiprofile.com (v2, query-string params). Used for part/OE search. */
export const APIPROFILE_BASE = "https://auto-parts-catalog.apiprofile.com/api/v2";
/** English. */
export const LANG_ID = 4;
/** United Arab Emirates. */
export const COUNTRY_ID = 259;
/** Commercial vehicles (trucks). 1 = passenger cars, 4 = LCV, 8 = bus. */
export const TYPE_ID = 2;
/** RapidAPI quota is small, and catalogue data changes slowly: cache for 30 days. */
export const CACHE_SECONDS = 60 * 60 * 24 * 30;
