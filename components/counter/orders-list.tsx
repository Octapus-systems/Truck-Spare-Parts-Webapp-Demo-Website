"use client";

import { useState, type KeyboardEvent } from "react";
import { CURRENCY, formatMoney, lineAmount } from "@/lib/store/billing";
import type { Customer, Order } from "@/lib/store/types";
import { Overlay } from "./overlay";

const STATUS_TONE = { new: "accent", billed: "green", cancelled: undefined } as const;

/** Shop orders. New ones first; Enter opens the selected new order as the bill. */
export function OrdersList({
  orders,
  customerOf,
  draftLines,
  onOpen,
  onCancel,
  onClose,
}: {
  orders: Order[];
  customerOf: (id: string) => Customer;
  draftLines: number;
  onOpen: (order: Order) => void;
  onCancel: (order: Order) => void;
  onClose: () => void;
}) {
  const sorted = [...orders].sort((a, b) => Number(b.status === "new") - Number(a.status === "new"));
  const [index, setIndex] = useState(0);
  const selected = sorted[index];

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") setIndex((i) => Math.min(i + 1, sorted.length - 1));
    else if (event.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
    else if (event.key === "Enter" && selected?.status === "new") onOpen(selected);
    else return;
    event.preventDefault();
  };

  const newCount = orders.filter((o) => o.status === "new").length;

  return (
    <Overlay title={`Shop orders · ${newCount} new`} onClose={onClose} wide>
      <div tabIndex={0} onKeyDown={onKey} ref={(el) => el?.focus()} className="outline-none">
        {draftLines > 0 && (
          <p className="border-b border-[var(--c-line)] bg-[#fff8e6] px-3 py-1.5 text-[12px]">
            Opening an order replaces the current draft bill ({draftLines} lines).
          </p>
        )}
        <table className="c-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Placed</th>
              <th className="w-full">Customer</th>
              <th>Fulfil</th>
              <th className="text-right">Items</th>
              <th className="text-right">Excl. VAT {CURRENCY}</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((order, i) => {
              const customer = customerOf(order.customerId);
              return (
                <tr key={order.number} aria-selected={i === index} onClick={() => setIndex(i)} onDoubleClick={() => order.status === "new" && onOpen(order)}>
                  <td className="mono">{order.number}</td>
                  <td className="mono">{new Date(order.createdAt).toLocaleString("en-AE", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="ellipsis">
                    {customer.name} <span className="mono muted">{customer.phone}</span>
                    {order.note && <span className="muted"> · “{order.note}”</span>}
                  </td>
                  <td>{order.fulfilment === "pickup" ? "Pickup" : "Delivery"}</td>
                  <td className="num">{order.lines.reduce((n, l) => n + l.qty, 0)}</td>
                  <td className="num">{formatMoney(order.lines.reduce((sum, l) => sum + lineAmount(l), 0))}</td>
                  <td>
                    <span className="c-tag" data-tone={STATUS_TONE[order.status]}>
                      {order.status === "billed" ? `BILLED ${order.invoice}` : order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {order.status === "new" && (
                      <span className="flex gap-1">
                        <button className="c-btn" data-primary="true" onClick={() => onOpen(order)}>
                          Open as bill
                        </button>
                        <button className="c-btn" onClick={() => onCancel(order)}>
                          Cancel
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!orders.length && <p className="muted p-4">No shop orders yet. Orders placed at checkout in the shop appear here.</p>}
        <p className="muted p-3 text-[12px]">
          <span className="c-kbd">↑</span> <span className="c-kbd">↓</span> select · <span className="c-kbd">Enter</span> open as
          bill · then <span className="c-kbd">F9</span> to invoice
        </p>
      </div>
    </Overlay>
  );
}
