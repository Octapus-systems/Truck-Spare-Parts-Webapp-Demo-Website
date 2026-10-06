"use client";

import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { billTotals, formatMoney, lineAmount } from "@/lib/store/billing";
import { customerOf } from "@/lib/store/reducer";
import { useAppState, useCatalog } from "@/lib/store/store";

const STATUS = {
  new: { icon: Clock, title: "Order received", body: "Our counter team is checking stock and fitment. You’ll get a call to confirm.", tone: "accent" },
  billed: { icon: FileText, title: "Invoiced", body: "Your order is confirmed and invoiced.", tone: "in" },
  cancelled: { icon: XCircle, title: "Cancelled", body: "This order was cancelled by our counter. Contact us if this is unexpected.", tone: "out" },
} as const;

export function OrderConfirmation() {
  const { number } = useParams<{ number: string }>();
  const state = useAppState();
  const products = useCatalog();
  const order = state.orders.find((o) => o.number === number);

  if (!order) {
    return (
      <div className="s-container py-20 text-center">
        <h1 className="text-2xl font-semibold">Order not found</h1>
        <p className="mt-2 text-[var(--s-text-2)]">Orders are stored in this browser for the demo.</p>
        <Link href="/parts" className="s-btn mt-6" data-variant="primary">Browse parts</Link>
      </div>
    );
  }

  const customer = customerOf(state, order.customerId);
  const totals = billTotals(order.lines, null);
  const status = STATUS[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="s-container max-w-[880px] py-12">
      <div className="text-center">
        <CheckCircle2 size={44} strokeWidth={1.5} className="mx-auto text-[var(--s-green)]" />
        <h1 className="mt-4 text-[clamp(26px,3.4vw,34px)] font-semibold tracking-[-.03em]">Thank you, {customer.name}</h1>
        <p className="mt-2 text-[var(--s-text-2)]">
          Order <span className="mono font-semibold text-[var(--s-text)]">{order.number}</span> has been sent to our counter.
        </p>
      </div>

      <div className="s-card mt-10 flex items-start gap-4 p-5">
        <StatusIcon size={22} className="mt-0.5 shrink-0 text-[var(--s-text-2)]" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{status.title}</p>
            <span className="s-badge" data-tone={status.tone}>
              {order.status === "billed" ? order.invoice : order.status.toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-[14px] text-[var(--s-text-2)]">{status.body}</p>
        </div>
      </div>

      <div className="s-card mt-4 overflow-hidden">
        <table className="w-full text-[14px]">
          <thead className="bg-[var(--s-surface)] text-start text-[12px] uppercase tracking-[.06em] text-[var(--s-muted)]">
            <tr>
              <th className="px-5 py-3 text-start font-semibold">Part</th>
              <th className="px-5 py-3 text-end font-semibold">Qty</th>
              <th className="px-5 py-3 text-end font-semibold">Amount (AED)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--s-line)]">
            {order.lines.map((line) => {
              const product = products.find((p) => p.id === line.productId);
              return (
                <tr key={line.productId}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{product?.name ?? line.productId}</p>
                    <p className="mono text-[12px] text-[var(--s-muted)]">{product?.brand} · {product?.partNumber}</p>
                  </td>
                  <td className="tnum px-5 py-3 text-end">{line.qty}</td>
                  <td className="tnum px-5 py-3 text-end">{formatMoney(lineAmount(line))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <dl className="tnum ms-auto grid max-w-xs grid-cols-[1fr_auto] gap-y-1 border-t border-[var(--s-line)] px-5 py-4 text-[14px]">
          <dt className="text-[var(--s-muted)]">Subtotal</dt>
          <dd>{formatMoney(totals.subtotal)}</dd>
          <dt className="text-[var(--s-muted)]">VAT 5%</dt>
          <dd>{formatMoney(totals.vat)}</dd>
          <dt className="font-semibold">Total AED</dt>
          <dd className="font-semibold">{formatMoney(totals.total)}</dd>
        </dl>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-3">
        <Info label="Fulfilment" value={order.fulfilment === "pickup" ? "Counter pickup" : "Delivery"} />
        <Info label="Contact" value={`${customer.phone}${customer.email ? ` · ${customer.email}` : ""}`} />
        <Info label="TRN" value={customer.trn ?? "—"} />
      </dl>
      {order.note && <p className="s-card mt-4 p-4 text-[14px] text-[var(--s-text-2)]">“{order.note}”</p>}

      <div className="mt-10 flex justify-center gap-3">
        <Link href="/parts" className="s-btn" data-variant="outline">Continue shopping</Link>
        <Link href="/counter" className="s-btn" data-variant="ghost">Open staff counter →</Link>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="s-card p-4">
      <dt className="text-[12px] font-semibold uppercase tracking-[.06em] text-[var(--s-muted)]">{label}</dt>
      <dd className="mono mt-1 truncate text-[14px]">{value}</dd>
    </div>
  );
}
