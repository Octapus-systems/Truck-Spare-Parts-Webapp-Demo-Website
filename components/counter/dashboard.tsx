"use client";

import type { Product } from "@/data/products";
import { CURRENCY, formatMoney } from "@/lib/store/billing";
import { dailySeries, invoicesCsv, lowStock, startOfDay, startOfMonth, summary, topParts, type Summary } from "@/lib/store/reports";
import type { AppState, Customer, QuoteRequest } from "@/lib/store/types";
import { Overlay } from "./overlay";

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  URL.revokeObjectURL(url);
}

export function Dashboard({
  state,
  products,
  customerOf,
  onCloseQuote,
  onClose,
}: {
  state: AppState;
  products: Product[];
  customerOf: (id: string) => Customer;
  onCloseQuote: (quote: QuoteRequest) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const tomorrow = new Date(startOfDay(now).getTime() + 86_400_000);
  const today = summary(state.invoices, state.creditNotes, startOfDay(now), tomorrow);
  const month = summary(state.invoices, state.creditNotes, startOfMonth(now), tomorrow);
  const series = dailySeries(state.invoices, state.creditNotes, now, 14);
  const peak = Math.max(1, ...series.map((d) => d.total));
  const top = topParts(state.invoices, state.creditNotes, 6);
  const low = lowStock(products, 5).slice(0, 8);
  const openQuotes = state.quotes.filter((q) => q.status === "open");
  const newOrders = state.orders.filter((o) => o.status === "new").length;

  return (
    <Overlay title="Dashboard" onClose={onClose} wide>
      <div className="grid gap-3 p-3">
        <div className="grid gap-3 md:grid-cols-2">
          <Figures title="Today" s={today} />
          <Figures title="This month" s={month} />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <Panel title={`Net sales · last 14 days (${CURRENCY})`}>
            <div className="flex h-36 items-end gap-1 px-1" role="img" aria-label="Net sales per day, last 14 days">
              {series.map((d) => (
                <div key={d.date.toISOString()} className="flex h-full flex-1 flex-col justify-end" title={`${d.date.toLocaleDateString("en-AE")}: ${formatMoney(d.total)}`}>
                  <div className="bg-[var(--c-text)]" style={{ height: `${(Math.max(d.total, 0) / peak) * 100}%`, minHeight: d.total > 0 ? 2 : 0 }} />
                </div>
              ))}
            </div>
            <div className="mono muted mt-1 flex justify-between text-[10px]">
              <span>{series[0].date.toLocaleDateString("en-AE", { day: "2-digit", month: "short" })}</span>
              <span>peak {formatMoney(peak === 1 ? 0 : peak)}</span>
              <span>today</span>
            </div>
          </Panel>

          <Panel title="Top parts (net qty)">
            {top.length ? (
              <table className="c-table">
                <tbody>
                  {top.map((p) => (
                    <tr key={`${p.brand}:${p.partNumber}`}>
                      <td className="ellipsis">
                        <span className="mono font-semibold">{p.partNumber}</span> <span className="muted">{p.brand}</span>
                      </td>
                      <td className="num">{p.qty}</td>
                      <td className="num">{formatMoney(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted p-2">No sales yet.</p>
            )}
          </Panel>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title={`Low stock · ≤ 5 (${low.length})`}>
            <table className="c-table">
              <tbody>
                {low.map((p) => (
                  <tr key={p.id}>
                    <td className="ellipsis">
                      <span className="mono font-semibold">{p.partNumber}</span> <span className="muted">{p.brand}</span> · {p.name}
                    </td>
                    <td className="num" style={{ color: p.stock <= 0 ? "var(--c-red)" : undefined }}>
                      {p.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title={`Quote requests from shop · ${openQuotes.length} open · ${newOrders} new orders (F6)`}>
            {openQuotes.length ? (
              <table className="c-table">
                <tbody>
                  {openQuotes.map((q) => {
                    const c = customerOf(q.customerId);
                    return (
                      <tr key={q.number}>
                        <td className="mono">{q.number}</td>
                        <td className="ellipsis">
                          <span className="mono font-semibold">{q.part.partNumber}</span> {q.part.brand} × {q.qty} · {c.name}{" "}
                          <span className="mono muted">{c.phone}</span>
                          {q.note && <span className="muted"> · “{q.note}”</span>}
                        </td>
                        <td>
                          <button className="c-btn !h-6" onClick={() => onCloseQuote(q)}>
                            Done
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="muted p-2">No open quote requests.</p>
            )}
          </Panel>
        </div>

        <div className="flex justify-between gap-2">
          <p className="muted text-[12px]">Net = invoices − credit notes. “Due” is unpaid balance incl. on-account sales.</p>
          <button className="c-btn" onClick={() => download(`invoices-${now.toISOString().slice(0, 10)}.csv`, invoicesCsv(state.invoices, state.creditNotes))} disabled={!state.invoices.length}>
            Export invoices CSV
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Figures({ title, s }: { title: string; s: Summary }) {
  const cells: [string, string][] = [
    [`Net sales ${CURRENCY}`, formatMoney(s.net)],
    ["VAT", formatMoney(s.vat)],
    ["Invoices", String(s.invoices)],
    ["Avg bill", formatMoney(s.average)],
    ["Credited", formatMoney(s.credited)],
    ["Due", formatMoney(s.due)],
  ];
  return (
    <Panel title={title}>
      <dl className="grid grid-cols-3 gap-px bg-[var(--c-line)]">
        {cells.map(([label, value]) => (
          <div key={label} className="bg-[var(--c-panel)] p-2">
            <dt className="text-[10.5px] uppercase tracking-[.06em] text-[var(--c-muted)]">{label}</dt>
            <dd className="mono text-[16px] font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="c-pane">
      <div className="c-pane-head">
        <span>{title}</span>
      </div>
      <div className="p-2">{children}</div>
    </section>
  );
}
