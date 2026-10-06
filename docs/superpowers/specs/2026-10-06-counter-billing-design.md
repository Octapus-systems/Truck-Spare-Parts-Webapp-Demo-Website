# Counter Catalogue & Billing — Design

Date: 2026-10-06
Status: Approved in brainstorming, pending spec review

## Goal

A keyboard-first parts catalogue and billing screen for counter staff, at
`/counter`, following the workflow:

SEARCH → PART FOUND → FITMENT → VERIFY → COMPARE → SELECT → STOCK CHECK →
ADD TO BILL → CUSTOMER → BILLING → CONFIRM → INVOICE CREATED

Every step is visible on one screen. Speed, density and keyboard operation
beat decoration: no hero, no illustrations, no gradients, no rounded cards,
no animation beyond instant state changes.

## Decisions

| Topic | Decision |
|---|---|
| Location | New route `/counter` in this Next.js app. Shop (`/`) unchanged by this spec. |
| Storage | Browser-only prototype (localStorage). No database, no login. Each browser has its own data. |
| Tax | UAE VAT 5%, AED. Tax invoice with optional customer TRN. |
| Billable items | Own catalogue items at catalogue price (deduct stock). TecDoc articles at a price typed at the counter, marked special order (`*SO`), no stock deduction. |
| Search sources | Own catalogue (`data/products.ts`) first, then TecDoc via existing `/api/tecdoc/search`. |
| Source spec | User's "UI/UX Prototype Requirements" (sections 1–5, truncated mid-5). Keyboard map below fills the missing part. |

Out of scope: shared/multi-user data, staff accounts, payments, returns/credit
notes, PDF generation (browser print only), Arabic UI for the counter, the
shop restyle (separate spec, see end).

## Architecture

```
app/counter/page.tsx            route; renders <CounterApp/> (client)
components/counter/
  counter-app.tsx               layout: top bar, 3 panes, key bar; owns focus state
  top-bar.tsx                   title, search input, customer, bill count, total, user, settings
  results-table.tsx             merged own + TecDoc rows, arrow-key selection
  part-detail.tsx               specs, OE numbers, fitment, stock by warehouse, verify/compare
  compare-table.tsx             side-by-side up to 4 parts
  bill-panel.tsx                lines, qty edit, discount, totals
  customer-picker.tsx           search/create customer
  price-prompt.tsx              manual price entry for TecDoc lines
  confirm-dialog.tsx            final summary before invoice
  invoice-view.tsx              printable tax invoice (print CSS)
  invoice-history.tsx           past invoices, reopen/reprint
  key-bar.tsx                   shortcut hints, generated from keys.ts
lib/counter/
  types.ts                      BillLine, Bill, Customer, Invoice, StockMovement
  billing.ts                    pure: line totals, discount, VAT, rounding, invoice numbers
  store.ts                      state + localStorage persistence; the only stateful module
  search.ts                     merges own-catalogue matches with TecDoc articles into rows
  keys.ts                       shortcut table + useCounterKeys hook
tests/counter.test.ts           billing.ts + search.ts + store reducers
```

Reused, unchanged: `lib/tecdoc/*`, `components/tecdoc/use-tecdoc.ts`
(`fetchTecdoc`), `data/products.ts`, `lib/tecdoc/match.ts`.

### Boundaries

- `billing.ts` is pure and has no React or storage imports. All money maths
  lives here.
- `store.ts` exposes actions (`addLine`, `updateQty`, `removeLine`,
  `setDiscount`, `setCustomer`, `upsertCustomer`, `confirmBill`, `newBill`,
  `resetDemo`) and a `useCounterStore(selector)` hook built on
  `useSyncExternalStore`. Components never touch localStorage. Replacing the
  store with a database later changes only this file.
- `search.ts` turns `(query, products, tecdocArticles)` into one row list;
  no fetching inside.

## Data model

```ts
type Money = number; // AED, stored in fils (integer, 1 AED = 100) to avoid float drift

type BillLine = {
  id: string;
  source: "own" | "tecdoc";
  productId: string | null;        // own items
  tecdocKey: string | null;        // TecDoc article key
  partNumber: string;
  brand: string;
  description: string;
  unitPrice: Money;                // own: catalogue price; tecdoc: typed at counter
  qty: number;
  verified: boolean;               // fitment checked by staff
  specialOrder: boolean;           // true for tecdoc lines
};

type Discount = { kind: "amount"; value: Money } | { kind: "percent"; value: number };

type Bill = { lines: BillLine[]; customerId: string; discount: Discount | null };

type Customer = { id: string; name: string; phone: string; trn: string | null };
// Seeded with id "walk-in", name "Walk-in customer"; cannot be deleted.

type Invoice = {
  number: string;                  // INV-2026-000001, sequential per browser
  issuedAt: string;                // ISO
  customer: Customer;              // snapshot
  lines: BillLine[];               // snapshot
  discount: Discount | null;
  subtotal: Money; discountTotal: Money; vat: Money; total: Money;
};

type StockMovement = { productId: string; qty: number; invoice: string }; // qty negative = out
```

Available stock = `product.stock` + sum of movements for that product.

Persisted under one localStorage key `counter:v1` as
`{ bill, customers, invoices, movements, nextInvoiceSeq }`. Reads and writes
are wrapped in try/catch; if storage fails the app keeps working in memory and
shows "Not saved — browser storage unavailable" in the status line.

## Billing rules (`billing.ts`)

- Line amount = `unitPrice × qty`.
- Subtotal = sum of line amounts.
- Discount applies to the subtotal: amount (capped at subtotal) or percent
  (0–100, rounded to the nearest fil).
- VAT = round(5% × (subtotal − discount)), half-up, in fils.
- Total = subtotal − discount + VAT.
- Prices in `data/products.ts` are treated as VAT-exclusive.
- Invoice number = `INV-{year}-{seq padded to 6}`; seq increments only on
  confirm.

## Stock check

- Adding an own item: if `qty` exceeds available stock, the line is still
  added but shown in red with "SHORT n" and confirm asks for a second
  keypress (`F9` again) to proceed. Stock can go negative (backorder) in the
  prototype.
- Confirm writes one `StockMovement` per own line.
- TecDoc lines never touch stock.

## Screen

Single screen, three panes, fixed key bar. Minimum comfortable width 1280px;
below 1024px the panes stack (results → detail → bill).

```
┌ PARTS CATALOGUE [/ Type part number / vehicle / description…] CUST │ BILL n │ AED total │ USER │ ⚙ ┐
├ RESULTS ─────────────────────┬ PART DETAIL ───────────────┬ BILL ──────────────────────┤
│ SRC BRAND PART DESC STK PRICE │ brand, part no, name        │ lines, qty, amount         │
│ OWN rows first, then TD rows  │ OE numbers, specs           │ subtotal, discount,        │
│                               │ fitment (TecDoc)            │ VAT 5%, TOTAL AED          │
│                               │ stock by warehouse          │                            │
├───────────────────────────────┴─────────────────────────────┴────────────────────────────┤
│ / Search ↑↓ Move Enter Detail F2 Add F3 Compare F4 Customer F8 Bill F9 Confirm Esc ? Keys │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

- Results: own matches appear instantly as you type; TecDoc is searched when
  Enter is pressed in the search box (query length ≥ 3). Changed from a
  400 ms debounce during build: the apiprofile monthly quota ran out in
  testing, and each search costs three calls. Search falls back to RapidAPI
  when every apiprofile lookup fails. TecDoc rows that match an own product (via
  `matchProduct`) are folded into the own row. Status line shows
  "TecDoc: searching… / n results / unavailable".
- Detail: TecDoc fitment uses existing `fitment` action (make + OE) for own
  items with OE numbers — make = first entry of the shop's `truckMakes`
  list that a `product.fitment` string starts with (same rule as the shop's
  product page) — `detail` action for TecDoc articles with an
  `articleId`. Thumbnail only here (64 px), with the existing missing-image
  fallback.
- Compare: overlay table, columns = parts (max 4), rows = source, brand,
  part no, price, stock, key specs, OE numbers.
- Invoice: full-screen overlay styled as a tax invoice (seller block, TRN,
  invoice no, date, customer, lines, totals, "Tax Invoice" title); print CSS
  hides everything else.

## Keyboard map

Global (always active unless a text field needs the key):

| Key | Action |
|---|---|
| `/` | Focus search (select existing text) |
| `↑` `↓` | Move selection in the focused list |
| `Enter` | Open detail for selected row / confirm dialog default |
| `Esc` | Close overlay, else return focus to results |
| `F2` | Add selected part to bill (own: qty 1; TecDoc: price prompt) |
| `F3` | Toggle selected part in compare set |
| `C` | Open compare (when results focused) |
| `V` | Toggle verified on selected part's bill line |
| `F4` | Customer picker |
| `F8` | Focus bill lines |
| `+` / `-` | Change qty of selected bill line |
| `Del` | Remove selected bill line |
| `D` | Discount prompt (`10%` or `25.50`) |
| `F9` | Confirm bill (second `F9` overrides short-stock warning) |
| `F10` | Invoice history |
| `N` | New bill (after invoice, or with confirm if lines exist) |
| `Ctrl+P` | Print invoice (when invoice open) |
| `?` | Shortcut list |

All shortcuts also have a visible button; mouse is optional, not removed.
Function keys call `preventDefault` to stop browser defaults (e.g. F3 find).
Shortcuts are defined once in `keys.ts`; `key-bar.tsx` and the `?` overlay
render from that table.

## Visual style

- Border radius 0–2 px; 1 px borders (`#d4d4d0` light / `#2a2b28` dark), no
  shadows except overlays.
- Inter for labels; JetBrains Mono (Google Fonts) for part numbers, prices,
  quantities, invoice numbers. Numbers right-aligned, tabular.
- Neutral greys, near-black text, one accent (`#1d4ed8`) for focus/selected
  row; red `#b91c1c` for short stock; green `#15803d` for verified.
- Table rows 28 px, 13 px text; pane headers 11 px uppercase.
- Light theme only for the prototype.

## Error handling

- TecDoc `not_configured` → TecDoc rows hidden, status line "TecDoc off".
  Other errors → status line "TecDoc unavailable", own results still shown.
- Price prompt rejects empty, zero or negative values.
- Discount prompt rejects values above subtotal / above 100%.
- Confirm disabled with no lines.
- Storage failure → in-memory mode with status warning (above).

## Testing

- `tests/counter.test.ts` (Node test runner, like `tests/tecdoc.test.ts`):
  billing maths (VAT rounding, discount caps, fils), invoice numbering,
  search merge/order/fold, stock availability from movements, store reducer
  actions.
- Manual browser run: search `1012010A53D` → add TecDoc line with price;
  search `2927801` → add own line ×20 to trigger SHORT; set customer with TRN;
  discount 10%; confirm; print preview; reload page and check bill/invoice
  history persisted.

## Follow-up: shop restyle (separate spec)

The shop at `/` will be restyled to this visual language (square elements,
1 px borders, mono data, no hero video/illustrations, denser layout) in its
own spec after the counter ships, reusing the tokens defined here.
