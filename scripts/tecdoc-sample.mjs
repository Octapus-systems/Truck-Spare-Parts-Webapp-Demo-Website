// Captures raw TecDoc responses from RapidAPI for writing normalisers.
// Usage: node --env-file=.env.local scripts/tecdoc-sample.mjs <name> <path>
// Free plan is ~100 requests/month — capture once, reuse fixtures.
import { mkdir, writeFile } from "node:fs/promises";

const HOST = "auto-parts-catalog.p.rapidapi.com";
const [name, path] = process.argv.slice(2);
if (!name || !path) {
  console.error("Usage: tecdoc-sample.mjs <name> <path>");
  process.exit(1);
}
const key = process.env.RAPIDAPI_KEY;
if (!key) throw new Error("RAPIDAPI_KEY missing");

const res = await fetch(`https://${HOST}${path}`, {
  headers: { "x-rapidapi-host": HOST, "x-rapidapi-key": key },
});
const text = await res.text();
console.log(
  `${res.status} ${text.length} bytes, remaining ${res.headers.get("x-ratelimit-requests-remaining")}`
);

const dir = new URL("../lib/tecdoc/__fixtures__/", import.meta.url);
await mkdir(dir, { recursive: true });
await writeFile(new URL(`${name}.json`, dir), text);
console.log(text.slice(0, 1200));
