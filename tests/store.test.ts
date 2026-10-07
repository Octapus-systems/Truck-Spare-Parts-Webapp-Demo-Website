// Run: npm test — shop ↔ counter wiring: cart, orders, shared stock, customers.
import assert from "node:assert/strict";
import { test } from "node:test";
import { seedProducts } from "../data/products.ts";
import { liveProducts } from "../lib/store/catalog.ts";
import {
  addToCart,
  cancelOrder,
  confirmBill,
  customerOf,
  hydrate,
  initialState,
  loadOrderIntoBill,
  orderNumber,
  placeOrder,
  setCartQty,
  setProductData,
} from "../lib/store/reducer.ts";

const NOW = new Date("2026-10-06T08:00:00Z");
const p1 = seedProducts.find((p) => p.id === "p1")!;
const p2 = seedProducts.find((p) => p.id === "p2")!;

const checkout = {
  customer: { name: "Fleet Co", phone: "050 123 4567", trn: null, email: "ops@fleet.example" },
  fulfilment: "pickup" as const,
  note: "  Call on arrival ",
};

test("cart add, set and remove", () => {
  let s = addToCart(initialState(), "p1");
  s = addToCart(s, "p1", 2);
  assert.equal(s.cart.p1, 3);
  s = setCartQty(s, "p1", 0);
  assert.deepEqual(s.cart, {});
});

test("placeOrder snapshots cart prices, saves customer, empties cart", () => {
  let s = addToCart(addToCart(initialState(), "p1", 2), "p2");
  const { state, order } = placeOrder(s, checkout, seedProducts, NOW);
  assert.equal(order?.number, "ORD-2026-0001");
  assert.deepEqual(order?.lines, [
    { productId: "p1", qty: 2, unitPrice: p1.price * 100 },
    { productId: "p2", qty: 1, unitPrice: p2.price * 100 },
  ]);
  assert.equal(order?.note, "Call on arrival");
  assert.equal(order?.status, "new");
  assert.deepEqual(state.cart, {});
  assert.equal(customerOf(state, order!.customerId).email, "ops@fleet.example");

  s = state;
  assert.equal(placeOrder(s, checkout, seedProducts, NOW).order, null); // empty cart
  assert.equal(orderNumber(2026, 12), "ORD-2026-0012");
});

test("returning customer is matched by phone digits", () => {
  let s = placeOrder(addToCart(initialState(), "p1"), checkout, seedProducts, NOW).state;
  const second = placeOrder(
    addToCart(s, "p2"),
    { ...checkout, customer: { ...checkout.customer, phone: "+971 50 123 4567", trn: "100123456700003" } },
    seedProducts,
    NOW,
  );
  s = second.state;
  assert.equal(s.customers.length, 2); // walk-in + one
  assert.equal(s.orders[0].customerId, s.orders[1].customerId);
  assert.equal(customerOf(s, second.order!.customerId).trn, "100123456700003");
});

test("counter loads an order, confirming bills it and moves stock", () => {
  const placed = placeOrder(addToCart(initialState(), "p1", 2), checkout, seedProducts, NOW);
  const s = loadOrderIntoBill(placed.state, placed.order!.number, seedProducts);
  assert.equal(s.bill.orderId, "ORD-2026-0001");
  assert.equal(s.bill.customerId, placed.order!.customerId);
  assert.equal(s.bill.lines[0].partNumber, p1.partNumber);
  assert.equal(s.bill.lines[0].qty, 2);

  const { state, invoice } = confirmBill(s, NOW);
  assert.equal(state.orders[0].status, "billed");
  assert.equal(state.orders[0].invoice, invoice!.number);
  assert.equal(state.bill.orderId, null);

  const live = liveProducts(seedProducts, state).find((p) => p.id === "p1")!;
  assert.equal(live.stock, p1.stock - 2);

  // Billed orders can't be loaded again.
  assert.equal(loadOrderIntoBill(state, "ORD-2026-0001", seedProducts), state);
});

test("cancelling an order clears it from the bill", () => {
  const placed = placeOrder(addToCart(initialState(), "p1"), checkout, seedProducts, NOW);
  let s = loadOrderIntoBill(placed.state, placed.order!.number, seedProducts);
  s = cancelOrder(s, placed.order!.number);
  assert.equal(s.orders[0].status, "cancelled");
  assert.equal(s.bill.lines.length, 0);
});

test("admin price and stock edits combine with sales", () => {
  let s = setProductData(initialState(), "p1", { price: 500, stock: 10 });
  const live = liveProducts(seedProducts, s).find((p) => p.id === "p1")!;
  assert.equal(live.price, 500);
  assert.equal(live.stock, 10);

  s = { ...s, movements: [{ productId: "p1", qty: -3, invoice: "INV-x" }] };
  assert.equal(liveProducts(seedProducts, s).find((p) => p.id === "p1")!.stock, 7);

  // Setting stock after sales sets the current figure, not the pre-sale one.
  s = setProductData(s, "p1", { stock: 20 });
  assert.equal(liveProducts(seedProducts, s).find((p) => p.id === "p1")!.stock, 20);
  assert.equal(liveProducts(seedProducts, s).find((p) => p.id === "p2"), p2);
});

test("hydrate upgrades counter-only saved state", () => {
  const old = { bill: { lines: [], customerId: "walk-in", discount: null }, invoices: [], movements: [], nextInvoiceSeq: 4 };
  const s = hydrate(old);
  assert.equal(s.bill.orderId, null);
  assert.deepEqual(s.orders, []);
  assert.equal(s.nextOrderSeq, 1);
  assert.equal(s.nextInvoiceSeq, 4);
  assert.deepEqual(s.prefs, { market: "UAE", locale: "en" });
});
