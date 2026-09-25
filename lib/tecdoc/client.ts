// Server-only RapidAPI client. The key is read from env and never sent to the browser.
import { TECDOC_HOST } from "./config";

export type TecdocErrorCode = "not_configured" | "quota" | "unauthorized" | "not_found" | "upstream";

export class TecdocError extends Error {
  constructor(
    readonly code: TecdocErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export const isTecdocConfigured = () => !!process.env.RAPIDAPI_KEY;

export async function tecdocGet(path: string): Promise<unknown> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) throw new TecdocError("not_configured", "RAPIDAPI_KEY is not set");

  const res = await fetch(`https://${TECDOC_HOST}${path}`, {
    headers: { "x-rapidapi-host": TECDOC_HOST, "x-rapidapi-key": key },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 429) throw new TecdocError("quota", "TecDoc request quota exceeded");
  if (res.status === 401 || res.status === 403) {
    throw new TecdocError("unauthorized", `TecDoc rejected the API key (${res.status})`);
  }
  if (res.status === 404) throw new TecdocError("not_found", `TecDoc endpoint not found: ${path}`);
  if (!res.ok) throw new TecdocError("upstream", `TecDoc responded ${res.status}`);
  return res.json();
}
