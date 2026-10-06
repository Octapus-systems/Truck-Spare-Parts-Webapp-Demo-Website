"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Customer } from "@/lib/store/types";
import { Overlay } from "./overlay";

const TRN = /^\d{15}$/;

/** Search existing customers (↑ ↓ Enter) or create a new one. */
export function CustomerPicker({
  customers,
  currentId,
  onPick,
  onSave,
  onClose,
}: {
  customers: Customer[];
  currentId: string;
  onPick: (id: string) => void;
  onSave: (customer: Omit<Customer, "id">) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState("");
  const [index, setIndex] = useState(0);
  const [creating, setCreating] = useState(false);

  const q = filter.trim().toLowerCase();
  const matches = customers.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.trn ?? "").includes(q),
  );
  const active = Math.min(index, Math.max(matches.length - 1, 0));

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") setIndex(Math.min(active + 1, matches.length - 1));
    else if (event.key === "ArrowUp") setIndex(Math.max(active - 1, 0));
    else if (event.key === "Enter") {
      if (matches[active]) onPick(matches[active].id);
      else setCreating(true);
    } else return;
    event.preventDefault();
  };

  if (creating) {
    return <NewCustomer initialName={filter} onSave={onSave} onBack={() => setCreating(false)} onClose={onClose} />;
  }

  return (
    <Overlay title="Customer" onClose={onClose}>
      <div className="grid gap-2 p-3">
        <input
          autoFocus
          className="c-input"
          placeholder="Search name, phone or TRN…"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setIndex(0);
          }}
          onKeyDown={onKey}
        />
        <table className="c-table">
          <thead>
            <tr>
              <th className="w-full">Name</th>
              <th>Phone</th>
              <th>TRN</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((c, i) => (
              <tr key={c.id} aria-selected={i === active} onClick={() => onPick(c.id)}>
                <td className="ellipsis">
                  {c.name} {c.id === currentId && <span className="c-tag">ON BILL</span>}
                </td>
                <td className="mono">{c.phone || "—"}</td>
                <td className="mono">{c.trn ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!matches.length && <p className="muted">No customer found. Enter creates “{filter}”.</p>}
        <div className="flex justify-between">
          <span className="muted text-[12px]">
            <span className="c-kbd">↑</span> <span className="c-kbd">↓</span> select · <span className="c-kbd">Enter</span> use
          </span>
          <button className="c-btn" onClick={() => setCreating(true)}>
            New customer
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function NewCustomer({
  initialName,
  onSave,
  onBack,
  onClose,
}: {
  initialName: string;
  onSave: (customer: Omit<Customer, "id">) => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [trn, setTrn] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError("Name is required");
    const cleanTrn = trn.replace(/\s/g, "");
    if (cleanTrn && !TRN.test(cleanTrn)) return setError("TRN must be 15 digits");
    onSave({ name: name.trim(), phone: phone.trim(), trn: cleanTrn || null });
  };

  return (
    <Overlay title="New customer" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 p-4">
        <Field label="Name *">
          <input autoFocus className="c-input" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className="c-input mono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05X XXX XXXX" />
        </Field>
        <Field label="TRN (business customers)">
          <input className="c-input mono" value={trn} onChange={(e) => setTrn(e.target.value)} placeholder="15 digits" />
        </Field>
        {error && <p className="text-[12px] text-[var(--c-red)]">{error}</p>}
        <div className="flex justify-between gap-2">
          <button type="button" className="c-btn" onClick={onBack}>
            Back to list
          </button>
          <button type="submit" className="c-btn" data-primary="true">
            Save & use <span className="c-kbd">Enter</span>
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-[var(--c-muted)]">{label}</span>
      {children}
    </label>
  );
}
