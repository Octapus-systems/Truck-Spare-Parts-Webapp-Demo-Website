// Run: npm test  (Node's built-in runner with native TypeScript stripping)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Product } from "../data/products.ts";
import { matchProduct } from "../lib/tecdoc/match.ts";
import {
  findManufacturer,
  parseArticleDetail,
  parseArticles,
  parseCategories,
  parseFitment,
  parseManufacturers,
  parseModels,
  parseVehicles,
  parseVin,
} from "../lib/tecdoc/normalize.ts";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../lib/tecdoc/__fixtures__/${name}.json`, import.meta.url), "utf8"));

test("manufacturers resolve free-text truck makes", () => {
  const list = parseManufacturers(fixture("manufacturers"));
  assert.ok(list.length > 200);
  assert.equal(findManufacturer("Mercedes-Benz", list)?.id, 74);
  assert.equal(findManufacturer("MAN", list)?.id, 69);
  assert.equal(findManufacturer("Nonexistent Motors", list), null);
});

test("models keep id, name and years", () => {
  const actros = parseModels(fixture("models")).find((m) => m.modelId === 9875);
  assert.deepEqual(actros, { modelId: 9875, name: "ACTROS MP4 / MP5", from: "2011-07-01", to: null });
});

test("vehicles merge engine-code rows by vehicleId", () => {
  const vehicles = parseVehicles(fixture("vehicles"));
  const ids = vehicles.map((v) => v.vehicleId);
  assert.equal(new Set(ids).size, ids.length);
  const first = vehicles.find((v) => v.vehicleId === 13438)!;
  assert.equal(first.engine, "1842 LS");
  assert.equal(first.powerPs, 422);
  assert.ok(first.engineCodes.length > 1);
});

test("categories flatten to leaves and skip graphic search", () => {
  const categories = parseCategories(fixture("categories"));
  const disc = categories.find((c) => c.id === 200338);
  assert.equal(disc?.name, "Brake Disc");
  assert.equal(disc?.group, "Braking System");
  assert.ok(categories.every((c) => c.name !== "Article Search via Graphic"));
});

test("article list keeps images; OE search keeps the OE reference", () => {
  const list = parseArticles(fixture("articles"));
  assert.equal(list[0].articleId, 10927676);
  assert.match(list[0].image ?? "", /^https:\/\//);

  const oe = parseArticles(fixture("analog-by-oem"));
  assert.ok(oe.length > 0);
  assert.equal(oe[0].articleId, null);
  assert.equal(oe[0].oeMatch?.brand, "MERCEDES-BENZ");
  assert.equal(new Set(oe.map((a) => a.key)).size, oe.length);
});

test("article detail exposes specs and OEM numbers", () => {
  const detail = parseArticleDetail(fixture("details"))!;
  assert.equal(detail.article.articleNo, "AZMT-44-024-2403");
  assert.ok(detail.specs.some((s) => s.name === "Height [mm]"));
  assert.ok(detail.oemNumbers.some((o) => o.brand === "MERCEDES-BENZ"));
});

test("fitment groups variants by model and dedupes", () => {
  const groups = parseFitment(fixture("vehicles-by-oem"));
  const actros = groups.find((g) => g.model === "ACTROS")!;
  assert.equal(actros.manufacturer, "MERCEDES-BENZ");
  assert.equal(actros.from, "1996-04-01");
  const keys = actros.variants.map((v) => [v.engine, v.bodyType, v.axle, v.from].join("|"));
  assert.equal(new Set(keys).size, keys.length);
  assert.ok(groups.every((g) => g.variants.length <= 30 && g.variantCount >= g.variants.length));
});

test("VIN uses decoder-v3 and falls back to v1", () => {
  const vin = "WDB9340321L123456";
  const full = parseVin(vin, fixture("vin"), fixture("vin-v1"));
  assert.equal(full.make, "Mercedes-Benz");
  assert.equal(full.model, "1844 LS");
  assert.equal(full.year, 2003);

  const fallback = parseVin(vin, [], fixture("vin-v1"));
  assert.equal(fallback.make, "Mercedes-Benz");
  assert.equal(fallback.year, 2001);
});

test("catalogue match needs same part number and brand", () => {
  const product = { partNumber: "14.9398.10", brand: "Brembo" } as Product;
  const article = parseArticles({
    articles: [{ articleNo: "14 9398 10", supplierName: "BREMBO" }],
  })[0];
  assert.equal(matchProduct(article, [product]), product);
  assert.equal(matchProduct({ ...article, supplierName: "Febi Bilstein" }, [product]), null);
});
