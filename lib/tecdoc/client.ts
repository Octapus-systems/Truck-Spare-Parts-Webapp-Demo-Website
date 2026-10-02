// Server-only TecDoc clients (RapidAPI and apiprofile.com). Keys are read from env
// and never sent to the browser.
import { APIPROFILE_BASE, TECDOC_HOST } from "./config";

export type TecdocErrorCode = "not_configured" | "quota" | "unauthorized" | "not_found" | "upstream";

export class TecdocError extends Error {
  constructor(
    readonly code: TecdocErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const isRapidapiConfigured = () => !!process.env.RAPIDAPI_KEY;
export const isApiprofileConfigured = () => !!process.env.APIPROFILE_KEY;
export const isTecdocConfigured = () => isRapidapiConfigured() || isApiprofileConfigured();

export async function tecdocGet(path: string): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new TecdocError("not_configured", "RAPIDAPI_KEY is not set");

  return parseResponse(
    await fetch(`https://${TECDOC_HOST}${path}`, {
      headers: { "x-rapidapi-host": TECDOC_HOST, "x-rapidapi-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    }),
    path,
  );
}

export async function apiprofileGet(path: string, params: Record<string, string | number>): Promise<unknown> {
  const key = process.env.APIPROFILE_KEY;
  if (!key) throw new TecdocError("not_configured", "APIPROFILE_KEY is not set");

  const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  return parseResponse(
    await fetch(`${APIPROFILE_BASE}${path}?${query}`, {
      headers: { Accept: "application/json", "x-apiprofile-key": key },
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    }),
    path,
  );
}

async function parseResponse(res: Response, path: string): Promise<unknown> {
  if (res.status === 429) throw new TecdocError("quota", "TecDoc request quota exceeded");
  if (res.status === 401 || res.status === 403) {
    throw new TecdocError("unauthorized", `TecDoc rejected the API key (${res.status})`);
  }
  if (res.status === 404) throw new TecdocError("not_found", `TecDoc endpoint not found: ${path}`);
  if (!res.ok) throw new TecdocError("upstream", `TecDoc responded ${res.status}`);
  return res.json();
}
