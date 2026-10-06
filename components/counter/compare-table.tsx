"use client";

import { CURRENCY, formatMoney } from "@/lib/counter/billing";
import type { ResultRow } from "@/lib/counter/types";
import { Overlay } from "./overlay";

/** Side-by-side comparison of up to 4 marked parts. */
export function CompareTable({
  rows,
  onAdd,
  onRemove,
  onClose,
}: {
  rows: ResultRow[];
  onAdd: (row: ResultRow) => void;
  onRemove: (row: ResultRow) => void;
  onClose: () => void;
}) {
  const specNames = [...new Set(rows.flatMap((r) => Object.keys(r.product?.specs ?? {})))];
  const fields: { label: string; value: (r: ResultRow) => React.ReactNode; mono?: boolean }[] = [
    { label: "Source", value: (r) => (r.source === "own" ? "Own stock" : "TecDoc · special order") },
    { label: "Description", value: (r) => r.description },
    { label: `Price ${CURRENCY}`, value: (r) => (r.price !== null ? formatMoney(r.price) : "quote"), mono: true },
    { label: "Stock", value: (r) => r.stock ?? "—", mono: true },
    { label: "Warehouse", value: (r) => r.product?.warehouse ?? "—" },
    {
      label: "OE numbers",
      value: (r) => (r.product ? r.product.oe.join(", ") : (r.article?.oeMatch?.number ?? "—")),
      mono: true,
    },
    ...specNames.map((name) => ({ label: name, value: (r: ResultRow) => r.product?.specs[name] ?? "—", mono: true })),
  ];

  return (
    <Overlay title={`Compare · ${rows.length} parts`} onClose={onClose} wide>
      <div className="overflow-x-auto">
        <table className="c-table">
          <thead>
            <tr>
              <th />
              {rows.map((r) => (
                <th key={r.key} className="!normal-case !tracking-normal">
                  <span className="block text-[10px] uppercase tracking-[.06em]">{r.brand}</span>
                  <span className="mono text-[13px] text-[var(--c-text)]">{r.partNumber}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.label}>
                <td className="muted">{f.label}</td>
                {rows.map((r) => (
                  <td key={r.key} className={f.mono ? "mono" : undefined}>
                    {f.value(r)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td />
              {rows.map((r) => (
                <td key={r.key} className="!h-11">
                  <span className="flex gap-1">
                    <button className="c-btn" data-primary="true" onClick={() => onAdd(r)}>
                      Add to bill
                    </button>
                    <button className="c-btn" onClick={() => onRemove(r)}>
                      Remove
                    </button>
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Overlay>
  );
}
