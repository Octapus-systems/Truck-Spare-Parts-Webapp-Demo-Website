// Pure state transitions for the counter. store.ts wraps these with persistence;
// tests call them directly.
import { billTotals, invoiceNumber } from "./billing.ts";
import type { BillLine, CounterState, Customer, Discount, Invoice } from "./types";

export const WALK_IN: Customer = { id: "walk-in", name: "Walk-in customer", phone: "", trn: null };

const newId = () => globalThis.crypto.randomUUID();

const emptyBill = () => ({ lines: [], customerId: WALK_IN.id, discount: null });

export const initialState = (): CounterState => ({
  bill: emptyBill(),
  customers: [WALK_IN],
  invoices: [],
  movements: [],
  nextInvoiceSeq: 1,
});

const withLines = (state: CounterState, lines: BillLine[]): CounterState => ({
  ...state,
  bill: { ...state.bill, lines },
});

/** Same own product, or same TecDoc article at the same price, adds to the existing line. */
export function addLine(state: CounterState, line: Omit<BillLine, "id">): CounterState {
  const lines = state.bill.lines;
  const existing = lines.find((l) =>
    line.source === "own"
      ? l.productId === line.productId
      : l.tecdocKey === line.tecdocKey && l.unitPrice === line.unitPrice,
  );
  if (existing) {
    return withLines(
      state,
      lines.map((l) => (l === existing ? { ...l, qty: l.qty + line.qty, verified: l.verified || line.verified } : l)),
    );
  }
  return withLines(state, [...lines, { ...line, id: newId() }]);
}

export const changeQty = (state: CounterState, lineId: string, delta: number): CounterState =>
  withLines(
    state,
    state.bill.lines.map((l) => (l.id === lineId ? { ...l, qty: Math.max(1, l.qty + delta) } : l)),
  );

export const removeLine = (state: CounterState, lineId: string): CounterState =>
  withLines(state, state.bill.lines.filter((l) => l.id !== lineId));

export const toggleVerified = (state: CounterState, lineId: string): CounterState =>
  withLines(
    state,
    state.bill.lines.map((l) => (l.id === lineId ? { ...l, verified: !l.verified } : l)),
  );

export const setDiscount = (state: CounterState, discount: Discount | null): CounterState => ({
  ...state,
  bill: { ...state.bill, discount },
});

export const setCustomer = (state: CounterState, customerId: string): CounterState => ({
  ...state,
  bill: { ...state.bill, customerId },
});

/** Adds or updates a customer and puts them on the bill. */
export function saveCustomer(state: CounterState, customer: Omit<Customer, "id"> & { id?: string }): CounterState {
  const id = customer.id ?? newId();
  const saved: Customer = { ...customer, id };
  const exists = state.customers.some((c) => c.id === id);
  return setCustomer(
    {
      ...state,
      customers: exists ? state.customers.map((c) => (c.id === id ? saved : c)) : [...state.customers, saved],
    },
    id,
  );
}

export const customerOf = (state: CounterState): Customer =>
  state.customers.find((c) => c.id === state.bill.customerId) ?? WALK_IN;

/** Snapshots the bill as an invoice, records stock movements for own lines, clears the bill. */
export function confirmBill(state: CounterState, now: Date): { state: CounterState; invoice: Invoice | null } {
  const { lines, discount } = state.bill;
  if (!lines.length) return { state, invoice: null };
  const number = invoiceNumber(now.getFullYear(), state.nextInvoiceSeq);
  const invoice: Invoice = {
    number,
    issuedAt: now.toISOString(),
    customer: customerOf(state),
    lines,
    discount,
    ...billTotals(lines, discount),
  };
  const movements = lines
    .filter((l) => l.source === "own" && l.productId)
    .map((l) => ({ productId: l.productId!, qty: -l.qty, invoice: number }));
  return {
    invoice,
    state: {
      ...state,
      bill: emptyBill(),
      invoices: [invoice, ...state.invoices],
      movements: [...state.movements, ...movements],
      nextInvoiceSeq: state.nextInvoiceSeq + 1,
    },
  };
}

export const newBill = (state: CounterState): CounterState => ({ ...state, bill: emptyBill() });

/** Defensive merge for data read back from localStorage. */
export function hydrate(raw: unknown): CounterState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const value = raw as Partial<CounterState>;
  const customers = Array.isArray(value.customers) ? value.customers : [];
  return {
    bill: value.bill && Array.isArray(value.bill.lines) ? value.bill : base.bill,
    customers: customers.some((c) => c.id === WALK_IN.id) ? customers : [WALK_IN, ...customers],
    invoices: Array.isArray(value.invoices) ? value.invoices : [],
    movements: Array.isArray(value.movements) ? value.movements : [],
    nextInvoiceSeq: typeof value.nextInvoiceSeq === "number" && value.nextInvoiceSeq > 0 ? value.nextInvoiceSeq : 1,
  };
}
