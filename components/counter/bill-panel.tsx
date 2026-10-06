"use client";

import { useEffect, useRef } from "react";
import { CURRENCY, describeDiscount, formatMoney, lineAmount } from "@/lib/store/billing";
import type { Bill, BillLine, Customer, Totals } from "@/lib/store/types";

export function BillPanel({
  bill,
  customer,
  totals,
  shortBy,
  selected,
  active,
  bodyRef,
  onSelect,
  onQty,
  onRemove,
  onDiscount,
  onConfirm,
  onCustomer,
}: {
  bill: Bill;
  customer: Customer;
  totals: Totals;
  shortBy: (line: BillLine) => number;
  selected: number;
  active: boolean;
  bodyRef: React.RefObject<HTMLDivElement | null>;
  onSelect: (index: number) => void;
  onQty: (line: BillLine, delta: number) => void;
  onRemove: (line: BillLine) => void;
  onDiscount: () => void;
  onConfirm: () => void;
  onCustomer: () => void;
}) {
  const selectedRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <section className="c-pane" data-active={active} aria-label="Bill">
      <div className="c-pane-head">
        <span>Bill · {bill.orderId ? `order ${bill.orderId}` : "draft"}</span>
        <button onClick={onCustomer} className="max-w-[60%] truncate font-normal normal-case tracking-normal">
          {customer.name}
          {customer.trn && <span className="mono muted"> · TRN {customer.trn}</span>}
        </button>
      </div>
      <div ref={bodyRef} tabIndex={-1} className="c-pane-body outline-none">
        <table className="c-table" aria-label="Bill lines">
          <thead>
            <tr>
              <th>#</th>
              <th className="w-full">Part</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bill.lines.map((line, index) => {
              const short = shortBy(line);
              return (
                <tr
                  key={line.id}
                  ref={index === selected ? selectedRef : undefined}
                  aria-selected={active && index === selected}
                  onClick={() => onSelect(index)}
                >
                  <td className="mono muted">{index + 1}</td>
                  <td className="ellipsis !h-auto py-1">
                    <span className="mono font-semibold">{line.partNumber}</span>{" "}
                    <span className="muted text-[11px] uppercase">{line.brand}</span>
                    <span className="block truncate text-[12px]">{line.description}</span>
                    <span className="mt-0.5 flex gap-1">
                      {line.specialOrder && <span className="c-tag">SO</span>}
                      {line.verified && <span className="c-tag" data-tone="green">✓ FIT</span>}
                      {short > 0 && <span className="c-tag" data-tone="red">SHORT {short}</span>}
                    </span>
                  </td>
                  <td className="num">
                    <span className="inline-flex items-center gap-1">
                      <button className="no-print px-1 text-[var(--c-muted)]" aria-label="Decrease quantity" onClick={() => onQty(line, -1)}>
                        −
                      </button>
                      {line.qty}
                      <button className="no-print px-1 text-[var(--c-muted)]" aria-label="Increase quantity" onClick={() => onQty(line, 1)}>
                        +
                      </button>
                    </span>
                  </td>
                  <td className="num">
                    {formatMoney(lineAmount(line))}
                    <button className="no-print ml-2 text-[var(--c-muted)] hover:text-[var(--c-red)]" aria-label={`Remove ${line.partNumber}`} onClick={() => onRemove(line)}>
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!bill.lines.length && (
          <p className="muted p-4">
            Empty. Select a part and press <span className="c-kbd">F2</span>.
          </p>
        )}
      </div>
      <div className="shrink-0 border-t border-[var(--c-line-strong)] p-3">
        <dl className="grid grid-cols-[1fr_auto] gap-y-0.5">
          <dt className="muted">Subtotal</dt>
          <dd className="num">{formatMoney(totals.subtotal)}</dd>
          <dt className="muted">
            <button onClick={onDiscount} className="hover:underline">
              Discount {describeDiscount(bill.discount) && `(${describeDiscount(bill.discount)})`} <span className="c-kbd">D</span>
            </button>
          </dt>
          <dd className="num">{totals.discountTotal ? `−${formatMoney(totals.discountTotal)}` : "0.00"}</dd>
          <dt className="muted">VAT 5%</dt>
          <dd className="num">{formatMoney(totals.vat)}</dd>
          <dt className="mt-1 border-t border-[var(--c-text)] pt-1 font-semibold">TOTAL {CURRENCY}</dt>
          <dd className="num mt-1 border-t border-[var(--c-text)] pt-1 text-[17px] font-bold">{formatMoney(totals.total)}</dd>
        </dl>
        <button className="c-btn mt-3 w-full justify-center" data-primary="true" disabled={!bill.lines.length} onClick={onConfirm}>
          Confirm bill <span className="c-kbd">F9</span>
        </button>
      </div>
    </section>
  );
}
