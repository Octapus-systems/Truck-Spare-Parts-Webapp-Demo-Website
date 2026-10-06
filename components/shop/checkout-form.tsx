"use client";

import { Lock, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formatMoney, toFils, billTotals } from "@/lib/store/billing";
import { placeOrder } from "@/lib/store/reducer";
import { update, useCatalog } from "@/lib/store/store";
import type { Order } from "@/lib/store/types";
import { useCartItems } from "./cart-sheet";

const TRN = /^\d{15}$/;
const PHONE = /^[+\d][\d\s-]{6,}$/;

/** Checkout: customer details → order for the counter. Totals are always AED (invoice currency). */
export function CheckoutForm() {
  const router = useRouter();
  const products = useCatalog();
  const { items } = useCartItems();
  const [fulfilment, setFulfilment] = useState<Order["fulfilment"]>("pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const totals = billTotals(
    items.map(({ product, qty }) => ({ unitPrice: toFils(product.price), qty })),
    null,
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const customer = {
      name: field("name"),
      phone: field("phone"),
      email: field("email"),
      trn: field("trn").replace(/\s/g, "") || null,
    };
    const problems: Record<string, string> = {};
    if (!customer.name) problems.name = "Enter your name or company";
    if (!PHONE.test(customer.phone)) problems.phone = "Enter a phone number we can reach you on";
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) problems.email = "Check the email address";
    if (customer.trn && !TRN.test(customer.trn)) problems.trn = "TRN is 15 digits";
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setSubmitting(true);
    let order: Order | null = null;
    update((s) => {
      const result = placeOrder(s, { customer, fulfilment, note: field("note") }, products, new Date());
      order = result.order;
      return result.state;
    });
    const placed = order as Order | null;
    if (placed) router.push(`/orders/${placed.number}`);
    else setSubmitting(false);
  };

  if (!items.length && submitting) return <p className="s-container py-20 text-center text-[var(--s-muted)]">Placing your order…</p>;
  if (!items.length) {
    return (
      <div className="s-container py-20 text-center">
        <h1 className="text-[28px] font-semibold tracking-[-.02em]">Your cart is empty</h1>
        <p className="mt-2 text-[var(--s-text-2)]">Add parts to your cart to check out.</p>
        <Link href="/parts" className="s-btn mt-6" data-variant="primary">
          Browse parts
        </Link>
      </div>
    );
  }

  return (
    <div className="s-container py-8 md:py-12">
      <h1 className="text-[clamp(28px,3.4vw,36px)] font-semibold tracking-[-.03em]">Checkout</h1>
      <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="grid gap-8">
          <fieldset className="s-card p-6">
            <legend className="float-left w-full text-[16px] font-semibold">Contact details</legend>
            <div className="clear-both grid pt-4 gap-4 sm:grid-cols-2">
              <Field name="name" label="Name or company *" error={errors.name} autoComplete="organization" />
              <Field name="phone" label="Mobile *" error={errors.phone} type="tel" autoComplete="tel" placeholder="05X XXX XXXX" />
              <Field name="email" label="Email" error={errors.email} type="email" autoComplete="email" />
              <Field name="trn" label="TRN (for VAT invoice)" error={errors.trn} placeholder="15 digits" inputMode="numeric" />
            </div>
            <p className="mt-3 text-[13px] text-[var(--s-muted)]">Returning customer? Use the same mobile number and we’ll link your account.</p>
          </fieldset>

          <fieldset className="s-card p-6">
            <legend className="float-left w-full text-[16px] font-semibold">Fulfilment</legend>
            <div className="clear-both grid pt-4 gap-3 sm:grid-cols-2">
              {(
                [
                  ["pickup", Store, "Counter pickup", "Dubai Investment Park · ready in 2 hours"],
                  ["delivery", Truck, "Delivery", "UAE-wide · same day before 2 pm"],
                ] as const
              ).map(([value, Icon, title, body]) => (
                <label key={value} className="flex cursor-pointer gap-3 rounded-xl border border-[var(--s-line-strong)] p-4 has-[:checked]:border-[var(--s-text)] has-[:checked]:bg-[var(--s-surface)]">
                  <input type="radio" name="fulfilment" value={value} checked={fulfilment === value} onChange={() => setFulfilment(value)} className="mt-1 accent-[var(--s-text)]" />
                  <span>
                    <span className="flex items-center gap-2 text-[15px] font-semibold">
                      <Icon size={16} /> {title}
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[var(--s-muted)]">{body}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="mt-4 block">
              <span className="s-label">Notes for the counter</span>
              <textarea name="note" rows={3} className="s-input !h-auto py-3" placeholder="Vehicle, VIN, delivery address or anything we should check" />
            </label>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="s-card p-6">
            <p className="text-[16px] font-semibold">Order summary</p>
            <ul className="mt-4 grid gap-3">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3">
                  <img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-lg bg-[var(--s-surface)] object-contain p-1 mix-blend-multiply" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{product.name}</p>
                    <p className="mono text-[12px] text-[var(--s-muted)]">
                      {product.partNumber} · ×{qty}
                      {qty > product.stock && <span className="text-[var(--s-amber)]"> · order-in</span>}
                    </p>
                  </div>
                  <span className="tnum text-[14px]">{formatMoney(toFils(product.price) * qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="tnum mt-5 grid grid-cols-[1fr_auto] gap-y-1.5 border-t border-[var(--s-line)] pt-4 text-[14px]">
              <dt className="text-[var(--s-muted)]">Subtotal</dt>
              <dd>AED {formatMoney(totals.subtotal)}</dd>
              <dt className="text-[var(--s-muted)]">VAT 5%</dt>
              <dd>AED {formatMoney(totals.vat)}</dd>
              <dt className="text-[var(--s-muted)]">{fulfilment === "delivery" ? "Delivery" : "Pickup"}</dt>
              <dd>Free</dd>
              <dt className="mt-2 text-[16px] font-semibold">Total</dt>
              <dd className="mt-2 text-[16px] font-semibold">AED {formatMoney(totals.total)}</dd>
            </dl>
            <button type="submit" disabled={submitting} className="s-btn mt-5 w-full" data-variant="primary" data-size="lg">
              <Lock size={15} /> Place order
            </button>
            <p className="mt-3 text-center text-[12px] leading-5 text-[var(--s-muted)]">
              No payment now. Our counter confirms stock and fitment, then issues your VAT invoice. Pay on pickup or delivery.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  error,
  ...input
}: { name: string; label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="s-label">{label}</span>
      <input name={name} className="s-input" aria-invalid={!!error} style={error ? { borderColor: "var(--s-red)" } : undefined} {...input} />
      {error && <span className="mt-1 block text-[12.5px] text-[var(--s-red)]">{error}</span>}
    </label>
  );
}
