# TecDoc (Apify) Integration — Design

Date: 2026-09-25
Status: Approved (approach A)

## Goal

Replace static demo fitment with real TecDoc data via the Apify actor
`making-data-meaningful/tecdoc`, while keeping the site's own catalogue
(price, stock, warehouse) as the commercial layer.

## Scope

1. Part / OE number search
2. Vehicle fitment picker (make → model → vehicle → category → parts)
3. VIN lookup (VIN → vehicle → parts)
4. Compatible vehicles on product page

Out of scope: pre-importing data into a database, pricing from TecDoc,
multi-language UI for TecDoc text (English only, `langId=4`).

## Approach

Live calls + cache. Server routes call Apify's
`POST /v2/acts/making-data-meaningful~tecdoc/run-sync-get-dataset-items`
with `APIFY_TOKEN` from server env. Results are cached with Next.js
`"use cache"` + `cacheLife("weeks")` (Vercel Runtime Cache in production).
The token is never exposed to the browser.

## Architecture

### `lib/tecdoc/`

| File | Responsibility |
|------|----------------|
| `config.ts` | `LANG_ID`, `COUNTRY_ID`, `TYPE_ID` constants. `TYPE_ID` is the commercial-vehicle type, confirmed via `/types/list-vehicles-type` before hard-coding. |
| `client.ts` | `runTecdoc(endpointFlag, params)` — builds actor input (`{ [endpointFlag]: true, ...params }`), POSTs with 60 s timeout, returns raw dataset items. Throws `TecdocError` on non-2xx/timeout. |
| `queries.ts` | Cached, typed functions: `searchByNumber`, `getManufacturers`, `getModels`, `getVehicles`, `getCategories`, `getArticles`, `decodeVin`, `getArticleCompatibility`. |
| `normalize.ts` | Raw TecDoc JSON → `TecdocArticle`, `TecdocVehicle`, `TecdocCategory`. Written against real sample payloads captured by `scripts/tecdoc-sample.mjs`. |
| `match.ts` | `matchCatalog(article, products)` — normalise numbers (strip spaces, dashes, dots; uppercase) and compare TecDoc article no + OE numbers with `Product.partNumber` / `Product.oe`. |

### `app/api/tecdoc/*` route handlers

`search`, `manufacturers`, `models`, `vehicles`, `categories`, `articles`,
`vin`, `compatibility`. Each validates query params with zod and returns
normalised JSON only.

### UI — `components/tecdoc/`

- `TecdocSearchResults` — rendered under local search results; loads async.
- `VehiclePicker` — cascading selects replacing static `trucks` dropdowns.
- `VinLookup` — VIN input feeding the same parts flow.
- `CompatibleVehicles` — panel on product page; falls back to static `fitment`.
- `TecdocPartCard` — matched part shows own price/stock + "Verified by TecDoc"
  badge; unmatched shows TecDoc data + "Request quote" (existing RFQ flow).

`app/page.tsx` only wires these components in.

## Error handling

- Apify timeout / error → inline notice "TecDoc unavailable — showing local
  catalogue"; page keeps working.
- Empty result → empty state.
- `APIFY_TOKEN` missing → routes return 503, UI hides TecDoc sections.

## Testing

- `scripts/tecdoc-sample.mjs` captures one real response per endpoint into
  `lib/tecdoc/__fixtures__/`.
- Unit tests for `normalize.ts` and `match.ts` against the fixtures.
- Manual check in dev: search `C 2029`, pick a truck, decode a VIN.

## Config

- `APIFY_TOKEN` in `.env.local` and Vercel project env (Production + Preview).
- Cost: $29/month flat or $0.001/result per actor pricing; caching keeps
  repeat queries free.
- Licensing: actor is a third-party TecDoc wrapper; confirm terms before
  commercial launch.
