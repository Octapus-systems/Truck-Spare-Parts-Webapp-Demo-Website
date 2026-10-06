"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { formatMoney } from "@/lib/store/billing";
import { setProductData } from "@/lib/store/reducer";
import { update, useAppState, useCatalog } from "@/lib/store/store";

/** Catalogue admin: price and stock edits are shared with the shop and the counter. */
export function AdminTable() {
  const products = useCatalog();
  const { orders, invoices } = useAppState();
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<{ id: string; price: string; stock: string } | null>(null);

  const q = filter.trim().toLowerCase();
  const rows = products.filter((p) => !q || [p.name, p.brand, p.partNumber, p.sku, ...p.oe].some((f) => f.toLowerCase().includes(q)));

  const save = (product: Product) => {
    if (!editing) return;
    const price = Number(editing.price);
    const stock = Number(editing.stock);
    if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(stock)) {
      toast.error("Price must be above zero and stock a whole number");
      return;
    }
    update((s) => setProductData(s, product.id, { price, stock }));
    setEditing(null);
    toast.success(`${product.partNumber} updated in shop and counter`);
  };

  return (
    <div className="s-container py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="s-eyebrow">Admin</p>
          <h1 className="mt-1 text-[clamp(26px,3.4vw,34px)] font-semibold tracking-[-.03em]">Catalogue data</h1>
          <p className="mt-1 text-[14px] text-[var(--s-text-2)]">Price and stock edits apply to the shop and the billing counter.</p>
        </div>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name, brand, part or OE…" className="s-input md:max-w-xs" aria-label="Filter products" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Metric label="Products" value={products.length} />
        <Metric label="Units in stock" value={products.reduce((s, p) => s + Math.max(0, p.stock), 0)} />
        <Metric label="Open shop orders" value={orders.filter((o) => o.status === "new").length} href="/counter" />
        <Metric label="Invoices issued" value={invoices.length} href="/counter" />
      </div>

      <div className="s-card mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="bg-[var(--s-surface)] text-[12px] uppercase tracking-[.06em] text-[var(--s-muted)]">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">Product</th>
              <th className="px-4 py-3 text-start font-semibold">Part / OE</th>
              <th className="px-4 py-3 text-end font-semibold">Stock</th>
              <th className="px-4 py-3 text-end font-semibold">Price AED</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--s-line)]">
            {rows.map((p) => {
              const isEditing = editing?.id === p.id;
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <Link href={`/parts/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                    <p className="text-[12.5px] text-[var(--s-muted)]">{p.brand} · {p.sku}</p>
                  </td>
                  <td className="mono px-4 py-3 text-[13px]">
                    {p.partNumber}
                    <span className="block text-[var(--s-muted)]">{p.oe[0]}</span>
                  </td>
                  <td className="tnum px-4 py-3 text-end">
                    {isEditing ? (
                      <input aria-label="Stock" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="s-input !h-9 !w-20 text-end" inputMode="numeric" />
                    ) : (
                      <span style={{ color: p.stock <= 0 ? "var(--s-red)" : undefined }}>{p.stock}</span>
                    )}
                  </td>
                  <td className="tnum px-4 py-3 text-end">
                    {isEditing ? (
                      <input aria-label="Price" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="s-input !h-9 !w-24 text-end" inputMode="decimal" />
                    ) : (
                      formatMoney(Math.round(p.price * 100))
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {isEditing ? (
                      <span className="flex justify-end gap-2">
                        <button className="s-btn" data-variant="ghost" data-size="sm" onClick={() => setEditing(null)}>Cancel</button>
                        <button className="s-btn" data-variant="primary" data-size="sm" onClick={() => save(p)}>Save</button>
                      </span>
                    ) : (
                      <button className="s-btn" data-variant="outline" data-size="sm" onClick={() => setEditing({ id: p.id, price: String(p.price), stock: String(p.stock) })}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value, href }: { label: string; value: number; href?: string }) {
  const body = (
    <>
      <p className="text-[13px] text-[var(--s-muted)]">{label}</p>
      <p className="tnum mt-1 text-[24px] font-semibold tracking-[-.02em]">{value.toLocaleString("en-AE")}</p>
    </>
  );
  return href ? (
    <Link href={href} className="s-card p-4" data-hover>{body}</Link>
  ) : (
    <div className="s-card p-4">{body}</div>
  );
}
