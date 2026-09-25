"use client";

import { useEffect, useState } from "react";

type Params = Record<string, string | number>;

export type TecdocResult<T> = { data: T | null; error: string | null; loading: boolean };

/** Session cache so moving between views doesn't refetch (server caches too). */
const memo = new Map<string, unknown>();

const urlFor = (action: string, params: Params) =>
  `/api/tecdoc/${action}?${new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  )}`;

export async function fetchTecdoc<T>(action: string, params: Params, signal?: AbortSignal): Promise<T> {
  const url = urlFor(action, params);
  if (memo.has(url)) return memo.get(url) as T;
  const res = await fetch(url, { signal });
  const body = (await res.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!res.ok) throw new Error(body.error ?? "upstream");
  memo.set(url, body.data);
  return body.data as T;
}

/** Fetches when `params` is non-null. Error "not_configured" means hide the feature. */
export function useTecdoc<T>(action: string, params: Params | null): TecdocResult<T> {
  const url = params ? urlFor(action, params) : null;
  const [result, setResult] = useState<{ url: string; data: T | null; error: string | null } | null>(null);

  useEffect(() => {
    if (!url || !params) return;
    const controller = new AbortController();
    fetchTecdoc<T>(action, params, controller.signal)
      .then((data) => setResult({ url, data, error: null }))
      .catch((error: Error) => {
        if (!controller.signal.aborted) setResult({ url, data: null, error: error.message });
      });
    return () => controller.abort();
    // `url` encodes action + params.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!url) return { data: null, error: null, loading: false };
  if (result?.url !== url) return { data: null, error: null, loading: true };
  return { data: result.data, error: result.error, loading: false };
}

export const tecdocErrorMessage = (error: string) =>
  error === "quota"
    ? "TecDoc request limit reached for this month."
    : "TecDoc is unavailable right now. Showing our own catalogue.";

export const yearRange = (from: string | null, to: string | null) =>
  from ? `${from.slice(0, 4)}–${to ? to.slice(0, 4) : "present"}` : "";
