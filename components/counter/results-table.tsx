"use client";

import { useEffect, useRef } from "react";
import { formatMoney } from "@/lib/counter/billing";
import type { ResultRow } from "@/lib/counter/types";

export type TecdocStatus = "idle" | "searching" | "off" | "quota" | "error" | "done";

export function ResultsTable({
  rows,
  selected,
  active,
  inBill,
  compareKeys,
  verifiedKeys,
  tecdocStatus,
  tecdocCount,
  query,
  bodyRef,
  onSelect,
  onOpen,
}: {
  rows: ResultRow[];
  selected: number;
  active: boolean;
  inBill: Map<string, number>;
  compareKeys: Set<string>;
  verifiedKeys: Set<string>;
  tecdocStatus: TecdocStatus;
  tecdocCount: number;
  query: string;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (index: number) => void;
  onOpen: (index: number) => void;
}) {
  const selectedRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const own = rows.filter((r) => r.source === "own").length;
  const tecdocLabel = {
    idle: query.trim().length < 3 ? "TecDoc: type 3+ characters" : "TecDoc: press Enter to search",
    searching: "TecDoc: searching…",
    off: "TecDoc: off",
    quota: "TecDoc: monthly quota used up",
    error: "TecDoc: unavailable",
    done: `TecDoc: ${tecdocCount}`,
  }[tecdocStatus];

  return (
    <section className="c-pane" data-active={active} aria-label="Search results">
      <div className="c-pane-head">
        <span>Results · {own} own stock</span>
        <span className="font-normal normal-case tracking-normal text-[var(--c-muted)]">{tecdocLabel}</span>
      </div>
      <div ref={bodyRef} tabIndex={-1} className="c-pane-body outline-none">
        <table className="c-table" role="grid" aria-label="Parts">
          <thead>
            <tr>
              <th>Src</th>
              <th>Brand</th>
              <th>Part no</th>
              <th className="w-full">Description</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Price</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const qty = inBill.get(row.key);
              return (
                <tr
                  key={row.key}
                  ref={index === selected ? selectedRef : undefined}
                  aria-selected={index === selected}
                  onClick={() => onSelect(index)}
                  onDoubleClick={() => onOpen(index)}
                >
                  <td>
                    <span className="c-tag" data-tone={row.source === "own" ? "own" : undefined}>
                      {row.source === "own" ? "OWN" : "TD"}
                    </span>
                  </td>
                  <td className="max-w-[140px] truncate font-medium">{row.brand}</td>
                  <td className="mono">{row.partNumber}</td>
                  <td className="ellipsis">{row.description}</td>
                  <td className="num" style={{ color: row.stock !== null && row.stock <= 0 ? "var(--c-red)" : undefined }}>
                    {row.stock ?? "—"}
                  </td>
                  <td className="num">{row.price !== null ? formatMoney(row.price) : "quote"}</td>
                  <td>
                    <span className="flex gap-1">
                      {verifiedKeys.has(row.key) && <span className="c-tag" data-tone="green">✓ FIT</span>}
                      {compareKeys.has(row.key) && <span className="c-tag" data-tone="accent">CMP</span>}
                      {qty && <span className="c-tag">BILL {qty}</span>}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="muted p-4">
            {tecdocStatus === "searching" ? "Searching TecDoc…" : `No parts match “${query}”.`}
          </p>
        )}
      </div>
    </section>
  );
}
