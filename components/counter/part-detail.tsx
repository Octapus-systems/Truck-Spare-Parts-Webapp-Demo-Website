"use client";

import { Package } from "lucide-react";
import { useState } from "react";
import { trucks } from "@/data/products";
import { CURRENCY, formatMoney } from "@/lib/store/billing";
import type { ResultRow } from "@/lib/store/types";
import type { FitmentGroup, TecdocArticleDetail } from "@/lib/tecdoc/types";
import { useTecdoc, yearRange } from "@/components/tecdoc/use-tecdoc";

const truckMakes = [...new Set(trucks.map((truck) => truck[0]))];

/** Same make rule as the shop's product page. */
const makeOf = (fitment: string[]) => truckMakes.find((make) => fitment.some((fit) => fit.startsWith(make))) ?? null;

/**
 * Detail for the selected row. TecDoc data (specs, OE numbers, fitment) is only
 * fetched once the row is opened with Enter — the RapidAPI quota is small.
 */
export function PartDetail({
  row,
  loaded,
  verified,
  compared,
  inBill,
}: {
  row: ResultRow | null;
  loaded: boolean;
  verified: boolean;
  compared: boolean;
  inBill: number;
}) {
  return (
    <section className="c-pane" aria-label="Part detail">
      <div className="c-pane-head">
        <span>Part detail</span>
        {row && !loaded && (
          <span className="font-normal normal-case tracking-normal text-[var(--c-muted)]">
            <span className="c-kbd">Enter</span> load fitment
          </span>
        )}
      </div>
      <div className="c-pane-body">
        {row ? (
          <Detail key={row.key} row={row} loaded={loaded} verified={verified} compared={compared} inBill={inBill} />
        ) : (
          <p className="muted p-4">Select a part with ↑ ↓.</p>
        )}
      </div>
    </section>
  );
}

function Detail({ row, loaded, verified, compared, inBill }: { row: ResultRow; loaded: boolean; verified: boolean; compared: boolean; inBill: number }) {
  const product = row.product;
  const article = row.article;
  const [imageFailed, setImageFailed] = useState(false);

  const detail = useTecdoc<TecdocArticleDetail | null>(
    "detail",
    loaded && article?.articleId ? { articleId: article.articleId } : null,
  );
  const ownMake = product ? makeOf(product.fitment) : null;
  const firstOem = detail.data?.oemNumbers[0];
  const fitmentParams = product
    ? ownMake && product.oe[0]
      ? { make: ownMake, oe: product.oe[0] }
      : null
    : firstOem
      ? { make: firstOem.brand, oe: firstOem.number }
      : null;
  const fitment = useTecdoc<FitmentGroup[]>("fitment", loaded ? fitmentParams : null);

  const oeNumbers = product
    ? product.oe.map((number) => ({ brand: ownMake ?? "OE", number }))
    : (detail.data?.oemNumbers ?? (article?.oeMatch ? [article.oeMatch] : []));
  const specs = product
    ? Object.entries(product.specs).map(([name, value]) => ({ name, value }))
    : (detail.data?.specs ?? []);

  return (
    <div className="grid gap-4 p-3">
      <div className="flex gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center border border-[var(--c-line)] bg-[#f6f6f4]">
          {row.image && !imageFailed ? (
            <img src={row.image} alt="" referrerPolicy="no-referrer" onError={() => setImageFailed(true)} className="h-full w-full object-contain p-1 mix-blend-multiply" />
          ) : (
            <Package size={22} strokeWidth={1.3} className="text-[var(--c-muted)]" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">{row.brand}</p>
          <p className="mono text-[16px] font-semibold">{row.partNumber}</p>
          <p className="truncate">{row.description}</p>
          <p className="mt-1 flex flex-wrap gap-1">
            <span className="c-tag" data-tone={row.source === "own" ? "own" : undefined}>
              {row.source === "own" ? "OWN STOCK" : "TECDOC · SPECIAL ORDER"}
            </span>
            {verified && <span className="c-tag" data-tone="green">✓ FITMENT VERIFIED</span>}
            {compared && <span className="c-tag" data-tone="accent">IN COMPARE</span>}
            {inBill > 0 && <span className="c-tag">IN BILL × {inBill}</span>}
          </p>
        </div>
      </div>

      <Block title="Stock & price">
        {product ? (
          <dl className="c-dl">
            <dt>Price</dt>
            <dd className="mono">
              {CURRENCY} {formatMoney(row.price ?? 0)} <span className="muted">excl. VAT</span>
            </dd>
            <dt>Available</dt>
            <dd className="mono" style={{ color: (row.stock ?? 0) <= 0 ? "var(--c-red)" : undefined }}>
              {row.stock} · {product.warehouse}
            </dd>
            <dt>SKU</dt>
            <dd className="mono">{product.sku}</dd>
            <dt>Category</dt>
            <dd>{product.category}</dd>
          </dl>
        ) : (
          <p className="muted">Not stocked. Price is entered at the counter when adding (F2).</p>
        )}
      </Block>

      <Block title="OE numbers">
        {oeNumbers.length ? (
          <ul className="grid gap-0.5">
            {oeNumbers.slice(0, 12).map((oe) => (
              <li key={`${oe.brand}-${oe.number}`} className="flex gap-2">
                <span className="muted w-28 shrink-0 truncate text-[11px] uppercase">{oe.brand || "OE"}</span>
                <span className="mono">{oe.number}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{article && !loaded ? "Press Enter to load from TecDoc." : detail.loading ? "Loading…" : "None listed."}</p>
        )}
      </Block>

      {specs.length > 0 && (
        <Block title="Specifications">
          <dl className="c-dl">
            {specs.slice(0, 14).map((s) => (
              <div key={s.name} className="contents">
                <dt>{s.name}</dt>
                <dd className="mono">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      <Block title="Fitment">
        {product && (
          <ul className="mb-2 grid gap-0.5">
            {product.fitment.map((fit) => (
              <li key={fit}>{fit}</li>
            ))}
          </ul>
        )}
        {!loaded ? (
          <p className="muted">
            <span className="c-kbd">Enter</span> loads TecDoc vehicle fitment. <span className="c-kbd">V</span> marks
            fitment verified.
          </p>
        ) : fitment.loading || detail.loading ? (
          <p className="muted">Loading TecDoc fitment…</p>
        ) : fitment.data?.length ? (
          <table className="c-table">
            <thead>
              <tr>
                <th className="w-full">TecDoc model</th>
                <th>Years</th>
                <th className="text-right">Variants</th>
              </tr>
            </thead>
            <tbody>
              {fitment.data.map((g) => (
                <tr key={`${g.manufacturer}-${g.model}`}>
                  <td className="ellipsis">
                    {g.manufacturer} {g.model}
                  </td>
                  <td className="mono">{yearRange(g.from, g.to)}</td>
                  <td className="num">{g.variantCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">
            {fitment.error || detail.error ? "TecDoc fitment unavailable." : "No TecDoc vehicle fitment listed."}
          </p>
        )}
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 border-b border-[var(--c-line)] pb-1 text-[10.5px] font-semibold uppercase tracking-[.08em] text-[var(--c-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
