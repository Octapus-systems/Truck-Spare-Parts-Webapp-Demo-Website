"use client";

import { useState } from "react";
import { formatMoney, parsePrice } from "@/lib/store/billing";
import { changeDue, PAYMENT_METHODS } from "@/lib/store/payments";
import type { Money, Payment, PaymentMethod } from "@/lib/store/types";

type Row = { method: PaymentMethod; amount: string };

const toInput = (fils: Money) => (fils / 100).toFixed(2);

/**
 * One or more payments against `due`. Starts as a single cash payment for the
 * full amount. Reports the parsed payments (or an error) on every change.
 */
export function usePaymentEntry(due: Money) {
  const [rows, setRows] = useState<Row[]>([{ method: "cash", amount: toInput(due) }]);
  const [tendered, setTendered] = useState("");

  const parsed = rows.map((r) => ({ method: r.method, amount: r.amount.trim() ? parsePrice(r.amount) : 0 }));
  const invalid = parsed.some((p) => p.amount === null);
  const total = parsed.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const cash = parsed.filter((p) => p.method === "cash").reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const tenderedFils = tendered.trim() ? parsePrice(tendered) : null;

  const error = invalid
    ? "Enter amounts like 120 or 120.50"
    : total > due
      ? `Payments exceed the amount due by ${formatMoney(total - due)}`
      : tenderedFils !== null && tenderedFils < cash
        ? "Cash tendered is less than the cash amount"
        : null;

  const at = new Date().toISOString();
  const payments: Payment[] = parsed
    .filter((p): p is { method: PaymentMethod; amount: Money } => !!p.amount)
    .map((p, i, all) => ({
      ...p,
      at,
      // Tendered applies to the first cash row only.
      ...(p.method === "cash" && tenderedFils && all.findIndex((x) => x.method === "cash") === i ? { tendered: tenderedFils } : {}),
    }));

  const form = (
    <div className="grid gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.method}
                type="button"
                className="c-btn !px-2"
                data-primary={row.method === m.method}
                onClick={() => setRows(rows.map((r, j) => (j === i ? { ...r, method: m.method } : r)))}
              >
                {m.label}
              </button>
            ))}
          </span>
          <input
            aria-label={`Payment ${i + 1} amount`}
            className="c-input mono !w-28 text-right"
            value={row.amount}
            onChange={(e) => setRows(rows.map((r, j) => (j === i ? { ...r, amount: e.target.value } : r)))}
          />
          {rows.length > 1 && (
            <button type="button" className="muted px-1 hover:text-[var(--c-red)]" aria-label="Remove payment" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
              ×
            </button>
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 text-[12px]">
        <button
          type="button"
          className="c-btn"
          onClick={() => setRows([...rows, { method: "card", amount: toInput(Math.max(0, due - total)) }])}
          disabled={total >= due}
        >
          + Split payment
        </button>
        {cash > 0 && (
          <label className="flex items-center gap-2">
            Cash tendered
            <input className="c-input mono !w-24 text-right" value={tendered} onChange={(e) => setTendered(e.target.value)} placeholder={toInput(cash)} />
          </label>
        )}
        {cash > 0 && tenderedFils !== null && tenderedFils >= cash && (
          <span className="mono font-semibold">Change {formatMoney(changeDue(tenderedFils, cash))}</span>
        )}
      </div>
      <p className="mono text-[12px]">
        Paying {formatMoney(total)} of {formatMoney(due)}
        {total < due && !invalid && <span className="text-[var(--c-red)]"> · {formatMoney(due - total)} left unpaid</span>}
      </p>
      {error && <p className="text-[12px] text-[var(--c-red)]">{error}</p>}
    </div>
  );

  return { form, payments, error };
}
