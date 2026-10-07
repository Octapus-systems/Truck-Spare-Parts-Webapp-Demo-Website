"use client";

import { useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { billTotals, formatMoney, parseDiscount, parsePrice, toFils } from "@/lib/store/billing";
import { useCounterKeys, type CounterAction } from "@/lib/store/keys";
import {
  addLine,
  cancelOrder,
  changeQty,
  confirmBill,
  customerOf,
  loadOrderIntoBill,
  newBill,
  removeLine,
  saveCustomer,
  setCustomer,
  setDiscount,
  toggleVerified,
} from "@/lib/store/reducer";
import { buildRows, findByCode, ownRow } from "@/lib/store/search";
import { isStorageOk, resetDemo, update, useAppState, useCatalog } from "@/lib/store/store";
import type { BillLine, CreditNote, Invoice, Order, Payment, ResultRow } from "@/lib/store/types";
import { amountDue, recordPayment } from "@/lib/store/payments";
import { closeQuote } from "@/lib/store/quotes";
import { issueCreditNote } from "@/lib/store/returns";
import type { TecdocArticle } from "@/lib/tecdoc/types";
import { useTecdoc } from "@/components/tecdoc/use-tecdoc";
import { BillPanel } from "./bill-panel";
import { CompareTable } from "./compare-table";
import { ConfirmDialog } from "./confirm-dialog";
import { CustomerPicker } from "./customer-picker";
import { InvoiceHistory } from "./invoice-history";
import { CreditNoteView, InvoiceView } from "./invoice-view";
import { CameraScan } from "./camera-scan";
import { Dashboard } from "./dashboard";
import { RecordPayment } from "./record-payment";
import { ReturnDialog } from "./return-dialog";
import { HelpOverlay, KeyBar } from "./key-bar";
import { OrdersList } from "./orders-list";
import { Prompt } from "./overlay";
import { PartDetail } from "./part-detail";
import { ResultsTable, type TecdocStatus } from "./results-table";
import { TopBar } from "./top-bar";

type Overlay =
  | { kind: "none" }
  | { kind: "price"; row: ResultRow }
  | { kind: "discount" }
  | { kind: "customer" }
  | { kind: "compare" }
  | { kind: "confirm" }
  | { kind: "invoice"; number: string; justCreated: boolean }
  | { kind: "creditNote"; creditNote: CreditNote }
  | { kind: "pay"; number: string }
  | { kind: "return"; number: string }
  | { kind: "dashboard" }
  | { kind: "scan" }
  | { kind: "history" }
  | { kind: "orders" }
  | { kind: "help" };

const MAX_COMPARE = 4;

const lineKey = (line: BillLine) => (line.source === "own" ? `own:${line.productId}` : `td:${line.tecdocKey}`);

export function CounterApp() {
  const state = useAppState();
  const products = useCatalog();
  const { bill } = state;

  const [query, setQuery] = useState("");
  /** Query last sent to TecDoc (on Enter) — the API quota is too small to search while typing. */
  const [tecdocQuery, setTecdocQuery] = useState("");
  const [pane, setPane] = useState<"results" | "bill">("results");
  const [rowIndex, setRowIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [openedKey, setOpenedKey] = useState<string | null>(null);
  const [compare, setCompare] = useState<ResultRow[]>([]);
  const [verifiedKeys, setVerifiedKeys] = useState<Set<string>>(new Set());
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const [status, setStatus] = useState("Ready. Type a part number, OE number, vehicle or description.");
  const [pendingNew, setPendingNew] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const billRef = useRef<HTMLDivElement>(null);

  const tecdoc = useTecdoc<TecdocArticle[]>("search", tecdocQuery.length >= 3 ? { q: tecdocQuery } : null);
  const tecdocCurrent = tecdocQuery === query.trim();
  const tecdocArticles = useMemo(() => (tecdocCurrent ? (tecdoc.data ?? []) : []), [tecdocCurrent, tecdoc.data]);
  const tecdocStatus: TecdocStatus = !tecdocCurrent
    ? "idle"
    : tecdoc.error === "not_configured"
      ? "off"
      : tecdoc.error === "quota"
        ? "quota"
        : tecdoc.error
          ? "error"
          : tecdoc.loading
            ? "searching"
            : tecdoc.data
              ? "done"
              : "idle";

  // Live products already include sold stock and admin edits.
  const stockOf = (product: Product) => product.stock;
  const rows = useMemo(
    () => buildRows(query, products, tecdocArticles, (p) => p.stock),
    [query, tecdocArticles, products],
  );

  const selectedIndex = Math.min(rowIndex, Math.max(rows.length - 1, 0));
  const selectedRow = rows[selectedIndex] ?? null;
  const selectedLineIndex = Math.min(lineIndex, Math.max(bill.lines.length - 1, 0));
  const selectedLine = bill.lines[selectedLineIndex] ?? null;

  const totals = billTotals(bill.lines, bill.discount);
  const customer = customerOf(state);

  const inBill = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of bill.lines) map.set(lineKey(line), (map.get(lineKey(line)) ?? 0) + line.qty);
    return map;
  }, [bill.lines]);

  const shortBy = (line: BillLine) => {
    if (line.source !== "own") return 0;
    const product = products.find((p) => p.id === line.productId);
    if (!product) return 0;
    const qtyInBill = bill.lines.filter((l) => l.productId === line.productId).reduce((n, l) => n + l.qty, 0);
    return Math.max(0, qtyInBill - stockOf(product));
  };

  const closeOverlay = () => setOverlay({ kind: "none" });
  const openInvoice =
    overlay.kind === "invoice" || overlay.kind === "pay" || overlay.kind === "return"
      ? state.invoices.find((i) => i.number === overlay.number)
      : undefined;

  const onQuery = (value: string) => {
    setQuery(value);
    setRowIndex(0);
    setOpenedKey(null);
    setPane("results");
  };

  const focusResults = () => {
    setPane("results");
    searchRef.current?.blur();
    resultsRef.current?.focus({ preventScroll: true });
  };

  const focusBill = () => {
    setPane("bill");
    searchRef.current?.blur();
    billRef.current?.focus({ preventScroll: true });
  };

  // ── Bill actions ────────────────────────────────────────────────────────
  const addRow = (row: ResultRow) => {
    if (row.source === "tecdoc") {
      setOverlay({ kind: "price", row });
      return;
    }
    const product = row.product!;
    const verified = verifiedKeys.has(row.key);
    update((s) =>
      addLine(s, {
        source: "own",
        productId: product.id,
        tecdocKey: null,
        partNumber: product.partNumber,
        brand: product.brand,
        description: product.name,
        unitPrice: toFils(product.price),
        qty: 1,
        verified,
        specialOrder: false,
      }),
    );
    const qty = (inBill.get(row.key) ?? 0) + 1;
    const stock = stockOf(product);
    setStatus(
      qty > stock
        ? `Added ${product.partNumber} — bill qty ${qty}, only ${stock} in stock (SHORT ${qty - stock}).`
        : `Added ${product.partNumber} × 1 (bill qty ${qty}, ${stock - qty} left).`,
    );
  };

  const addTecdoc = (row: ResultRow, price: number) => {
    const article = row.article!;
    update((s) =>
      addLine(s, {
        source: "tecdoc",
        productId: null,
        tecdocKey: article.key,
        partNumber: article.articleNo,
        brand: article.supplierName,
        description: article.productName ?? "Spare part",
        unitPrice: price,
        qty: 1,
        verified: verifiedKeys.has(row.key),
        specialOrder: true,
      }),
    );
    setStatus(`Added ${article.articleNo} (${article.supplierName}) as special order at ${formatMoney(price)}.`);
    closeOverlay();
  };

  const lineForRow = (row: ResultRow | null) => (row ? bill.lines.find((l) => lineKey(l) === row.key) : undefined);

  const qty = (line: BillLine | null | undefined, delta: number) => {
    if (!line) return setStatus("No bill line selected. Press F8 to move into the bill.");
    update((s) => changeQty(s, line.id, delta));
    setStatus(`${line.partNumber} qty ${Math.max(1, line.qty + delta)}.`);
  };

  const remove = (line: BillLine | null | undefined) => {
    if (!line) return setStatus("No bill line selected. Press F8 to move into the bill.");
    update((s) => removeLine(s, line.id));
    setStatus(`Removed ${line.partNumber}.`);
  };

  const toggleVerify = () => {
    if (pane === "bill") {
      if (!selectedLine) return;
      update((s) => toggleVerified(s, selectedLine.id));
      setStatus(`${selectedLine.partNumber} fitment ${selectedLine.verified ? "unverified" : "verified"}.`);
      return;
    }
    if (!selectedRow) return;
    const on = !verifiedKeys.has(selectedRow.key);
    setVerifiedKeys((keys) => {
      const next = new Set(keys);
      if (on) next.add(selectedRow.key);
      else next.delete(selectedRow.key);
      return next;
    });
    const line = lineForRow(selectedRow);
    if (line && line.verified !== on) update((s) => toggleVerified(s, line.id));
    setStatus(`${selectedRow.partNumber} fitment ${on ? "verified" : "unverified"}.`);
  };

  const toggleCompare = (row: ResultRow | null) => {
    if (!row) return;
    if (compare.some((r) => r.key === row.key)) {
      setCompare((rows) => rows.filter((r) => r.key !== row.key));
      setStatus(`Removed ${row.partNumber} from compare.`);
    } else if (compare.length >= MAX_COMPARE) {
      setStatus(`Compare holds ${MAX_COMPARE} parts. Remove one first (F3 on a marked part).`);
    } else {
      setCompare((rows) => [...rows, row]);
      setStatus(`Marked ${row.partNumber} for compare (${compare.length + 1}/${MAX_COMPARE}). Press C to open.`);
    }
  };

  const confirm = (payments: Payment[]) => {
    let created = null as Invoice | null;
    update((s) => {
      const result = confirmBill(s, new Date(), payments);
      created = result.invoice;
      return result.state;
    });
    if (!created) return;
    const invoice: Invoice = created;
    setOverlay({ kind: "invoice", number: invoice.number, justCreated: true });
    setVerifiedKeys(new Set());
    setCompare([]);
    setLineIndex(0);
    setPane("results");
    setStatus(`Invoice ${invoice.number} created · ${formatMoney(invoice.total)} AED.`);
  };

  const openOrder = (order: Order) => {
    update((s) => loadOrderIntoBill(s, order.number, products));
    setVerifiedKeys(new Set());
    setLineIndex(0);
    closeOverlay();
    focusBill();
    setStatus(`Order ${order.number} loaded into the bill. Check fitment and stock, then F9 to invoice.`);
  };

  const addByCode = (code: string) => {
    const product = findByCode(code, products);
    if (!product) {
      setStatus(`No part, SKU or OE number matches “${code}”.`);
      return false;
    }
    addRow(ownRow(product, product.stock));
    onQuery("");
    searchRef.current?.focus();
    return true;
  };

  const issueReturn = (invoiceNo: string, request: Parameters<typeof issueCreditNote>[2]) => {
    let note = null as CreditNote | null;
    update((s) => {
      const result = issueCreditNote(s, invoiceNo, request, new Date());
      note = result.creditNote;
      return result.state;
    });
    const issued = note as CreditNote | null;
    if (!issued) return setStatus("Nothing left to return on that invoice.");
    setOverlay({ kind: "creditNote", creditNote: issued });
    setStatus(`Credit note ${issued.number} issued · ${formatMoney(issued.total)} AED. Stock returned.`);
  };

  const startNewBill = () => {
    if (bill.lines.length && !pendingNew) {
      setPendingNew(true);
      setStatus("Bill has lines. Press N again to discard it and start a new bill.");
      return;
    }
    update(newBill);
    setPendingNew(false);
    setVerifiedKeys(new Set());
    setStatus("New bill started.");
  };

  // ── Keyboard ────────────────────────────────────────────────────────────
  const run = (action: CounterAction): boolean | void => {
    if (action !== "newBill") setPendingNew(false);

    if (overlay.kind !== "none") {
      if (action === "escape") return closeOverlay();
      if (action === "confirm" && overlay.kind === "confirm") {
        // Submit the dialog so its payment validation runs.
        document.querySelector<HTMLFormElement>("[role=dialog] form")?.requestSubmit();
        return;
      }
      if (action === "newBill" && overlay.kind === "invoice") return closeOverlay();
      return false; // overlays handle their own keys
    }

    switch (action) {
      case "search":
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      case "up":
      case "down": {
        const delta = action === "up" ? -1 : 1;
        if (pane === "bill") setLineIndex(Math.min(Math.max(selectedLineIndex + delta, 0), Math.max(bill.lines.length - 1, 0)));
        else {
          if (document.activeElement === searchRef.current) focusResults();
          setRowIndex(Math.min(Math.max(selectedIndex + delta, 0), Math.max(rows.length - 1, 0)));
        }
        return;
      }
      case "enter":
        if (document.activeElement === searchRef.current) {
          const q = query.trim();
          // Barcode scanners type the code and press Enter: exact matches go straight to the bill.
          if (findByCode(q, products)) {
            addByCode(q);
            return;
          }
          if (q.length >= 3 && q !== tecdocQuery) {
            setTecdocQuery(q);
            setRowIndex(0);
            setStatus(`Searching TecDoc for “${q}”…`);
          }
          return focusResults();
        }
        if (pane === "results" && selectedRow) {
          setOpenedKey(selectedRow.key);
          setStatus(`Opened ${selectedRow.partNumber}: TecDoc specs and fitment in the detail pane.`);
        }
        return;
      case "escape":
        if (pane === "bill") return focusResults();
        if (document.activeElement === searchRef.current && query) return onQuery("");
        return focusResults();
      case "add":
        if (selectedRow) addRow(selectedRow);
        return;
      case "compare":
        return toggleCompare(selectedRow);
      case "openCompare":
        if (!compare.length) return setStatus("Nothing to compare. Mark parts with F3 first.");
        return setOverlay({ kind: "compare" });
      case "verify":
        return toggleVerify();
      case "customer":
        return setOverlay({ kind: "customer" });
      case "bill":
        return pane === "bill" ? focusResults() : focusBill();
      case "qtyUp":
      case "qtyDown":
        return qty(pane === "bill" ? selectedLine : lineForRow(selectedRow), action === "qtyUp" ? 1 : -1);
      case "remove":
        return remove(pane === "bill" ? selectedLine : lineForRow(selectedRow));
      case "discount":
        if (!bill.lines.length) return setStatus("Add parts before setting a discount.");
        return setOverlay({ kind: "discount" });
      case "confirm":
        if (!bill.lines.length) return setStatus("Bill is empty. Add parts with F2.");
        return setOverlay({ kind: "confirm" });
      case "history":
        return setOverlay({ kind: "history" });
      case "dashboard":
        return setOverlay({ kind: "dashboard" });
      case "scan":
        return setOverlay({ kind: "scan" });
      case "orders":
        return setOverlay({ kind: "orders" });
      case "newBill":
        return startNewBill();
      case "help":
        return setOverlay({ kind: "help" });
    }
  };
  useCounterKeys(run);

  return (
    <div className="flex h-screen flex-col">
      <TopBar
        searchRef={searchRef}
        query={query}
        onQuery={onQuery}
        customerName={customer.name}
        lineCount={bill.lines.length}
        newOrders={state.orders.filter((o) => o.status === "new").length}
        onOrders={() => run("orders")}
        total={totals.total}
        onCustomer={() => run("customer")}
        onBill={() => run("bill")}
        onReset={() => {
          resetDemo();
          setVerifiedKeys(new Set());
          setCompare([]);
          setStatus("Demo data reset: bill, customers, invoices and stock movements cleared.");
        }}
      />

      <WorkflowStrip bill={bill.lines} customerSet={customer.id !== "walk-in"} hasSelection={!!selectedRow} opened={!!openedKey} compared={compare.length} verified={verifiedKeys.size > 0} invoiced={overlay.kind === "invoice"} />

      <main className="grid min-h-0 flex-1 gap-1.5 overflow-auto p-1.5 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)_minmax(320px,.95fr)] lg:overflow-hidden">
        <ResultsTable
          rows={rows}
          selected={selectedIndex}
          active={pane === "results"}
          inBill={inBill}
          compareKeys={new Set(compare.map((r) => r.key))}
          verifiedKeys={verifiedKeys}
          tecdocStatus={tecdocStatus}
          tecdocCount={tecdocArticles.length}
          query={query}
          bodyRef={resultsRef}
          onSelect={(i) => {
            setRowIndex(i);
            setPane("results");
          }}
          onOpen={(i) => {
            setRowIndex(i);
            setOpenedKey(rows[i]?.key ?? null);
          }}
        />
        <PartDetail
          row={selectedRow}
          loaded={!!selectedRow && openedKey === selectedRow.key}
          verified={!!selectedRow && verifiedKeys.has(selectedRow.key)}
          compared={!!selectedRow && compare.some((r) => r.key === selectedRow.key)}
          inBill={selectedRow ? (inBill.get(selectedRow.key) ?? 0) : 0}
        />
        <BillPanel
          bill={bill}
          customer={customer}
          totals={totals}
          shortBy={shortBy}
          selected={selectedLineIndex}
          active={pane === "bill"}
          bodyRef={billRef}
          onSelect={(i) => {
            setLineIndex(i);
            setPane("bill");
          }}
          onQty={(line, delta) => qty(line, delta)}
          onRemove={remove}
          onDiscount={() => run("discount")}
          onConfirm={() => run("confirm")}
          onCustomer={() => run("customer")}
        />
      </main>

      <div className="no-print flex h-6 shrink-0 items-center justify-between gap-3 border-t border-[var(--c-line)] bg-[var(--c-panel)] px-2 text-[11.5px]" role="status" aria-live="polite">
        <span className="truncate">{status}</span>
        {!isStorageOk() && <span className="shrink-0 text-[var(--c-red)]">Not saved — browser storage unavailable</span>}
      </div>
      <KeyBar onAction={(action) => run(action)} />

      {overlay.kind === "price" && (
        <Prompt
          title="Special order price"
          label="Unit price AED (excl. VAT)"
          placeholder="e.g. 45.00"
          hint={
            <>
              <span className="mono font-semibold">{overlay.row.partNumber}</span> · {overlay.row.brand} ·{" "}
              {overlay.row.description}
              <span className="muted block">Not in stock. Price is your quote; the line is marked special order.</span>
            </>
          }
          validate={(v) => (parsePrice(v) === null ? "Enter a price above zero, e.g. 45 or 45.50" : null)}
          onSubmit={(v) => addTecdoc(overlay.row, parsePrice(v)!)}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "discount" && (
        <Prompt
          title="Discount"
          label="Amount (AED) or percent"
          placeholder="10%  or  25.50   (empty = none)"
          hint={<span className="muted">Applied to the subtotal of {formatMoney(totals.subtotal)} before VAT.</span>}
          validate={(v) => {
            const parsed = parseDiscount(v, totals.subtotal);
            return parsed && "error" in parsed ? parsed.error : null;
          }}
          onSubmit={(v) => {
            const parsed = parseDiscount(v, totals.subtotal);
            const discount = parsed && "error" in parsed ? null : parsed;
            update((s) => setDiscount(s, discount));
            setStatus(discount ? "Discount applied." : "Discount removed.");
            closeOverlay();
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "customer" && (
        <CustomerPicker
          customers={state.customers}
          currentId={bill.customerId}
          onPick={(id) => {
            update((s) => setCustomer(s, id));
            setStatus(`Customer: ${state.customers.find((c) => c.id === id)?.name}.`);
            closeOverlay();
          }}
          onSave={(c) => {
            update((s) => saveCustomer(s, c));
            setStatus(`Customer saved: ${c.name}.`);
            closeOverlay();
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "compare" && (
        <CompareTable
          rows={compare}
          onAdd={(row) => {
            closeOverlay();
            addRow(row);
          }}
          onRemove={(row) => {
            const left = compare.filter((r) => r.key !== row.key);
            setCompare(left);
            if (!left.length) closeOverlay();
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "confirm" && (
        <ConfirmDialog bill={bill} customer={customer} totals={totals} shortBy={shortBy} onConfirm={confirm} onClose={closeOverlay} />
      )}
      {overlay.kind === "invoice" && openInvoice && (
        <InvoiceView
          invoice={openInvoice}
          creditNotes={state.creditNotes}
          justCreated={overlay.justCreated}
          onNew={closeOverlay}
          onPay={() => setOverlay({ kind: "pay", number: openInvoice.number })}
          onReturn={() => setOverlay({ kind: "return", number: openInvoice.number })}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "creditNote" && <CreditNoteView creditNote={overlay.creditNote} onClose={closeOverlay} />}
      {overlay.kind === "pay" && openInvoice && (
        <RecordPayment
          invoice={openInvoice}
          due={amountDue(openInvoice, state.creditNotes)}
          onSave={(payments) => {
            update((s) => payments.reduce((acc, p) => recordPayment(acc, openInvoice.number, p), s));
            setStatus(`Payment recorded on ${openInvoice.number}.`);
            setOverlay({ kind: "invoice", number: openInvoice.number, justCreated: false });
          }}
          onClose={() => setOverlay({ kind: "invoice", number: openInvoice.number, justCreated: false })}
        />
      )}
      {overlay.kind === "return" && openInvoice && (
        <ReturnDialog
          invoice={openInvoice}
          creditNotes={state.creditNotes}
          onIssue={(request) => issueReturn(openInvoice.number, request)}
          onClose={() => setOverlay({ kind: "invoice", number: openInvoice.number, justCreated: false })}
        />
      )}
      {overlay.kind === "dashboard" && (
        <Dashboard
          state={state}
          products={products}
          customerOf={(id) => customerOf(state, id)}
          onCloseQuote={(q) => {
            update((s) => closeQuote(s, q.number));
            setStatus(`Quote request ${q.number} marked done.`);
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "scan" && (
        <CameraScan
          onCode={(code) => {
            closeOverlay();
            if (addByCode(code)) setStatus(`Scanned ${code} → added to bill.`);
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "history" && (
        <InvoiceHistory
          invoices={state.invoices}
          creditNotes={state.creditNotes}
          onOpen={(invoice) => setOverlay({ kind: "invoice", number: invoice.number, justCreated: false })}
          onOpenCredit={(creditNote) => setOverlay({ kind: "creditNote", creditNote })}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "orders" && (
        <OrdersList
          orders={state.orders}
          customerOf={(id) => customerOf(state, id)}
          draftLines={bill.orderId ? 0 : bill.lines.length}
          onOpen={openOrder}
          onCancel={(order) => {
            update((s) => cancelOrder(s, order.number));
            setStatus(`Order ${order.number} cancelled.`);
          }}
          onClose={closeOverlay}
        />
      )}
      {overlay.kind === "help" && <HelpOverlay onClose={closeOverlay} />}
    </div>
  );
}

/** The spec's workflow, always visible; steps light up as the bill progresses. */
function WorkflowStrip({
  bill,
  customerSet,
  hasSelection,
  opened,
  compared,
  verified,
  invoiced,
}: {
  bill: BillLine[];
  customerSet: boolean;
  hasSelection: boolean;
  opened: boolean;
  compared: number;
  verified: boolean;
  invoiced: boolean;
}) {
  const hasLines = bill.length > 0 || invoiced;
  const steps: [string, boolean][] = [
    ["Search", true],
    ["Part found", hasSelection],
    ["Fitment", opened],
    ["Verify", verified || bill.some((l) => l.verified)],
    ["Compare", compared > 0],
    ["Select", hasLines],
    ["Stock check", hasLines],
    ["Add to bill", hasLines],
    ["Customer", customerSet],
    ["Billing", hasLines],
    ["Confirm", invoiced],
    ["Invoice", invoiced],
  ];
  return (
    <ol className="no-print flex h-6 shrink-0 items-stretch overflow-x-auto border-b border-[var(--c-line)] bg-[var(--c-panel)] text-[10.5px] font-medium uppercase tracking-[.05em]">
      {steps.map(([label, done], i) => (
        <li
          key={label}
          className="flex shrink-0 items-center gap-1.5 border-r border-[var(--c-line)] px-2.5"
          style={{ color: done ? "var(--c-text)" : "var(--c-muted)", background: done ? "#eef1ee" : undefined }}
        >
          <span className="mono">{String(i + 1).padStart(2, "0")}</span>
          {label}
          {done && <span className="text-[var(--c-green)]">✓</span>}
        </li>
      ))}
    </ol>
  );
}
