# Unified Shop + Counter — Design

Date: 2026-10-06
Status: Approved in conversation

## Goal

One web app where the customer parts shop and the staff billing counter share
data: stock and prices, customers, and orders (shop checkout → counter bill →
invoice). The shop gets a premium, search-first redesign; the counter keeps
its dense keyboard-first style (see `2026-10-06-counter-billing-design.md`).

## Decisions

| Topic | Decision |
|---|---|
| Storage | Still browser-only (localStorage, one key). Shop and counter share data only within the same browser — enough for the demo; a database later replaces `lib/store/store.ts` only. |
| Shared data | Products (admin price/stock edits), stock movements, customers, orders, cart, display prefs. |
| Orders | Shop checkout creates `ORD-{year}-{seq:4}` with status `new`. Counter `F6` opens the order list; loading an order fills the bill (lines + customer). Confirming the bill marks the order `billed` with the invoice number. Staff can cancel an order. |
| Customers | Checkout saves name, phone, email, optional TRN. Returning customers matched by phone digits. Same list as counter `F4`. |
| Navigation | Shop pages share one header; small "Staff · Billing" link to `/counter`; counter top bar links back to the shop. No login (demo). |
| Routes | `/`, `/parts?q=&make=&category=`, `/parts/[id]`, `/checkout`, `/orders/[number]`, `/admin`, `/counter`. Shop routes live in an `app/(shop)` route group with a shared layout. |
| Removed | Old single-page `app/page.tsx` view switcher; "Request formal quotation" dialog (replaced by checkout); hero video. |
| Kept | Currency picker (AED/QAR/SAR/USD, display only — orders and invoices are in AED); Arabic toggle (RTL + hero/nav strings); TecDoc search, vehicle finder, VIN, fitment. |
| TecDoc quota | Shop TecDoc cross-reference search runs only for a submitted search (`/parts?q=`), never while typing. |

## Data model additions (`lib/store/types.ts`)

```ts
type Customer = { id; name; phone; trn: string | null; email?: string };
type OrderLine = { productId: string; qty: number; unitPrice: Money };
type Order = {
  number: string; createdAt: string; customerId: string;
  lines: OrderLine[]; fulfilment: "pickup" | "delivery"; note: string;
  status: "new" | "billed" | "cancelled"; invoice: string | null;
};
type ProductOverride = { price?: number; stockBase?: number };
// Bill gains orderId: string | null.
// AppState = CounterState + { orders, nextOrderSeq, overrides, cart, prefs }.
```

Live product = seed product with `price` override and
`stock = (stockBase ?? seed.stock) + Σ movements`. Admin "set stock to N"
stores `stockBase = N − Σ movements`.

## Units

- `lib/store/` — moved from `lib/counter/` (types, billing, reducer, search,
  keys, store) plus `catalog.ts` (live products) and order/cart/override
  reducers. Pure modules stay test-importable.
- `lib/shop/market.ts` — currency display.
- `components/shop/` — header, cart sheet, footer, search box with
  suggestions, hero, trust strip, category grid, product card, featured,
  brand row, how-it-works, parts browser (filters/sort/grid/list + TecDoc),
  product detail, checkout form, order confirmation, admin table.
- `components/counter/` — add orders overlay (`F6`), orders badge, shop link;
  use live catalogue instead of seed products.

## Visual style (shop)

White and graphite (`#0f1115` text, `#f6f7f9` surfaces), one accent
(`#0b5cff`) for focus and links, Inter, 8 px radius, 1 px borders
(`#e5e7eb`), shadows only on hover/overlays, tabular numbers for prices and
part numbers. Hero: headline + large search with suggestions + vehicle card
(Make → Model → Year/VIN via TecDoc finder) side by side; no video.

## Testing

- Unit: placeOrder (customer match/create, numbering), loadOrderIntoBill,
  confirmBill marks order billed, overrides + movements → live stock, cart.
- Browser: shop search → product → cart → checkout → order page; counter
  `F6` → load order → `F9` → invoice; shop shows reduced stock.
