// Pure state transitions shared by the shop and the counter. store.ts wraps
// these with persistence; tests call them directly.
import type { Product } from "../../data/products";
import { billTotals, invoiceNumber, toFils } from "./billing.ts";
import type { AppState, Bill, BillLine, Customer, Discount, Invoice, Order, Prefs } from "./types";

export const WALK_IN: Customer = { id: "walk-in", name: "Walk-in customer", phone: "", trn: null };

const DEFAULT_PREFS: Prefs = { market: "UAE", locale: "en" };

const newId = () => globalThis.crypto.randomUUID();

const emptyBill = (): Bill => ({ lines: [], customerId: WALK_IN.id, discount: null, orderId: null });

export const initialState = (): AppState => ({
  bill: emptyBill(),
  customers: [WALK_IN],
  invoices: [],
  movements: [],
  nextInvoiceSeq: 1,
  orders: [],
  nextOrderSeq: 1,
  overrides: {},
  cart: {},
  prefs: DEFAULT_PREFS,
});

// ── Bill ────────────────────────────────────────────────────────────────────

const withLines = (state: AppState, lines: BillLine[]): AppState => ({
  ...state,
  bill: { ...state.bill, lines },
});

/** Same own product, or same TecDoc article at the same price, adds to the existing line. */
export function addLine(state: AppState, line: Omit<BillLine, "id">): AppState {
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

export const changeQty = (state: AppState, lineId: string, delta: number): AppState =>
  withLines(
    state,
    state.bill.lines.map((l) => (l.id === lineId ? { ...l, qty: Math.max(1, l.qty + delta) } : l)),
  );

export const removeLine = (state: AppState, lineId: string): AppState =>
  withLines(state, state.bill.lines.filter((l) => l.id !== lineId));

export const toggleVerified = (state: AppState, lineId: string): AppState =>
  withLines(
    state,
    state.bill.lines.map((l) => (l.id === lineId ? { ...l, verified: !l.verified } : l)),
  );

export const setDiscount = (state: AppState, discount: Discount | null): AppState => ({
  ...state,
  bill: { ...state.bill, discount },
});

export const setCustomer = (state: AppState, customerId: string): AppState => ({
  ...state,
  bill: { ...state.bill, customerId },
});

export const newBill = (state: AppState): AppState => ({ ...state, bill: emptyBill() });

// ── Customers ───────────────────────────────────────────────────────────────

const phoneKey = (phone: string) => phone.replace(/\D/g, "").replace(/^(00971|971|0)/, "");

/** Adds or updates a customer (by id) and puts them on the bill. */
export function saveCustomer(state: AppState, customer: Omit<Customer, "id"> & { id?: string }): AppState {
  const { state: next, id } = upsertCustomer(state, customer);
  return setCustomer(next, id);
}

/**
 * Adds or updates a customer without touching the bill. Without an id, a
 * customer with the same phone number is reused (shop checkout returning customers).
 */
export function upsertCustomer(
  state: AppState,
  customer: Omit<Customer, "id"> & { id?: string },
): { state: AppState; id: string } {
  const samePhone = phoneKey(customer.phone)
    ? state.customers.find((c) => c.id !== WALK_IN.id && phoneKey(c.phone) === phoneKey(customer.phone))
    : undefined;
  const id = customer.id ?? samePhone?.id ?? newId();
  const existing = state.customers.find((c) => c.id === id);
  const saved: Customer = {
    ...existing,
    ...customer,
    trn: customer.trn ?? existing?.trn ?? null,
    id,
  };
  return {
    id,
    state: {
      ...state,
      customers: existing ? state.customers.map((c) => (c.id === id ? saved : c)) : [...state.customers, saved],
    },
  };
}

export const customerOf = (state: AppState, id = state.bill.customerId): Customer =>
  state.customers.find((c) => c.id === id) ?? WALK_IN;

// ── Invoices ────────────────────────────────────────────────────────────────

/**
 * Snapshots the bill as an invoice, records stock movements for own lines,
 * marks the source shop order billed, and clears the bill.
 */
export function confirmBill(state: AppState, now: Date): { state: AppState; invoice: Invoice | null } {
  const { lines, discount, orderId } = state.bill;
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
      orders: orderId
        ? state.orders.map((o) => (o.number === orderId ? { ...o, status: "billed", invoice: number } : o))
        : state.orders,
    },
  };
}

// ── Shop: cart and orders ───────────────────────────────────────────────────

export const setCartQty = (state: AppState, productId: string, qty: number): AppState => {
  const cart = { ...state.cart };
  if (qty > 0) cart[productId] = qty;
  else delete cart[productId];
  return { ...state, cart };
};

export const addToCart = (state: AppState, productId: string, qty = 1): AppState =>
  setCartQty(state, productId, (state.cart[productId] ?? 0) + qty);

export const orderNumber = (year: number, seq: number) => `ORD-${year}-${String(seq).padStart(4, "0")}`;

export type CheckoutInput = {
  customer: Omit<Customer, "id">;
  fulfilment: Order["fulfilment"];
  note: string;
};

/** Turns the cart into an order at current prices, saves the customer, empties the cart. */
export function placeOrder(
  state: AppState,
  input: CheckoutInput,
  products: Product[],
  now: Date,
): { state: AppState; order: Order | null } {
  const lines = Object.entries(state.cart)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      return product && qty > 0 ? { productId, qty, unitPrice: toFils(product.price) } : null;
    })
    .filter((line): line is Order["lines"][number] => line !== null);
  if (!lines.length) return { state, order: null };

  const { state: withCustomer, id: customerId } = upsertCustomer(state, input.customer);
  const order: Order = {
    number: orderNumber(now.getFullYear(), state.nextOrderSeq),
    createdAt: now.toISOString(),
    customerId,
    lines,
    fulfilment: input.fulfilment,
    note: input.note.trim(),
    status: "new",
    invoice: null,
  };
  return {
    order,
    state: { ...withCustomer, cart: {}, orders: [order, ...state.orders], nextOrderSeq: state.nextOrderSeq + 1 },
  };
}

/** Replaces the counter's draft bill with a shop order's lines and customer. */
export function loadOrderIntoBill(state: AppState, orderNo: string, products: Product[]): AppState {
  const order = state.orders.find((o) => o.number === orderNo);
  if (!order || order.status !== "new") return state;
  const lines: BillLine[] = order.lines.map((line) => {
    const product = products.find((p) => p.id === line.productId);
    return {
      id: newId(),
      source: "own",
      productId: line.productId,
      tecdocKey: null,
      partNumber: product?.partNumber ?? line.productId,
      brand: product?.brand ?? "",
      description: product?.name ?? "Catalogue item",
      unitPrice: line.unitPrice,
      qty: line.qty,
      verified: false,
      specialOrder: false,
    };
  });
  return { ...state, bill: { lines, customerId: order.customerId, discount: null, orderId: order.number } };
}

export const cancelOrder = (state: AppState, orderNo: string): AppState => ({
  ...state,
  orders: state.orders.map((o) => (o.number === orderNo && o.status === "new" ? { ...o, status: "cancelled" } : o)),
  bill: state.bill.orderId === orderNo ? emptyBill() : state.bill,
});

// ── Admin and prefs ─────────────────────────────────────────────────────────

/** Sets price (AED) and/or current stock. Stock is stored relative to recorded movements. */
export function setProductData(
  state: AppState,
  productId: string,
  change: { price?: number; stock?: number },
): AppState {
  const moved = state.movements.reduce((sum, m) => (m.productId === productId ? sum + m.qty : sum), 0);
  const current = state.overrides[productId] ?? {};
  return {
    ...state,
    overrides: {
      ...state.overrides,
      [productId]: {
        ...current,
        ...(change.price !== undefined && { price: change.price }),
        ...(change.stock !== undefined && { stockBase: change.stock - moved }),
      },
    },
  };
}

export const setPrefs = (state: AppState, prefs: Partial<Prefs>): AppState => ({
  ...state,
  prefs: { ...state.prefs, ...prefs },
});

// ── Persistence ─────────────────────────────────────────────────────────────

const isObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/** Defensive merge for data read back from localStorage (older versions lack shop fields). */
export function hydrate(raw: unknown): AppState {
  const base = initialState();
  if (!isObject(raw)) return base;
  const value = raw as Partial<AppState>;
  const customers = Array.isArray(value.customers) ? value.customers : [];
  const bill = value.bill && Array.isArray(value.bill.lines) ? { ...base.bill, ...value.bill } : base.bill;
  return {
    bill,
    customers: customers.some((c) => c.id === WALK_IN.id) ? customers : [WALK_IN, ...customers],
    invoices: Array.isArray(value.invoices) ? value.invoices : [],
    movements: Array.isArray(value.movements) ? value.movements : [],
    nextInvoiceSeq: typeof value.nextInvoiceSeq === "number" && value.nextInvoiceSeq > 0 ? value.nextInvoiceSeq : 1,
    orders: Array.isArray(value.orders) ? value.orders : [],
    nextOrderSeq: typeof value.nextOrderSeq === "number" && value.nextOrderSeq > 0 ? value.nextOrderSeq : 1,
    overrides: isObject(value.overrides) ? (value.overrides as AppState["overrides"]) : {},
    cart: isObject(value.cart) ? (value.cart as AppState["cart"]) : {},
    prefs: { ...DEFAULT_PREFS, ...(isObject(value.prefs) ? value.prefs : {}) },
  };
}
