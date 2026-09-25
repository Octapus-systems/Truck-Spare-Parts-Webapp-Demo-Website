"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { matchProduct } from "@/lib/tecdoc/match";
import type { TecdocArticle } from "@/lib/tecdoc/types";
import { TecdocPartCard, type CatalogActions } from "./part-card";
import { tecdocErrorMessage, useTecdoc } from "./use-tecdoc";

const PAGE = 12;

/** Part-number / OE-number cross-reference results shown under local search results. */
export function TecdocSearchResults({ query, catalog }: { query: string; catalog: CatalogActions }) {
  const q = query.trim();
  const { data, error, loading } = useTecdoc<TecdocArticle[]>("search", q.length >= 3 ? { q } : null);
  const [shown, setShown] = useState(PAGE);

  if (q.length < 3 || error === "not_configured") return null;

  const articles = [...(data ?? [])].sort(
    (a, b) => Number(!!matchProduct(b, catalog.products)) - Number(!!matchProduct(a, catalog.products)),
  );

  return (
    <section className="mt-14 border-t border-[#e4e4e0] pt-10" aria-label="TecDoc cross-references">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8a8b87]">TecDoc catalogue</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-.02em]">Cross-references for “{q}”</h2>
      {loading && (
        <p className="mt-6 flex items-center gap-2 text-sm text-[#777873]">
          <Spinner /> Searching TecDoc…
        </p>
      )}
      {error && <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{tecdocErrorMessage(error)}</p>}
      {data && articles.length === 0 && (
        <p className="mt-6 text-sm text-[#777873]">No TecDoc articles match this part or OE number.</p>
      )}
      {articles.length > 0 && (
        <>
          <p className="mt-2 text-sm text-[#777873]">{articles.length} articles from TecDoc</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {articles.slice(0, shown).map((article) => (
              <TecdocPartCard key={article.key} article={article} catalog={catalog} />
            ))}
          </div>
          {shown < articles.length && (
            <button onClick={() => setShown((n) => n + PAGE)} className="mt-6 rounded-md border border-[#d8d8d4] bg-white px-4 py-2.5 text-sm font-medium">
              Show more ({articles.length - shown} left)
            </button>
          )}
        </>
      )}
    </section>
  );
}
