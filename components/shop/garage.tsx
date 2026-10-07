"use client";

import { Check, Plus, Trash2, Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Product } from "@/data/products";
import { trucks } from "@/data/products";
import { activeVehicle, fitsVehicle, removeVehicle, saveVehicle, setActiveVehicle } from "@/lib/store/garage";
import { update, useAppState } from "@/lib/store/store";
import type { Vehicle } from "@/lib/store/types";

/** Active garage vehicle, if any. */
export function useActiveVehicle() {
  const state = useAppState();
  return activeVehicle(state);
}

/** "Fits your <truck>" badge when the active vehicle matches the product. */
export function FitsBadge({ product, className = "" }: { product: Product; className?: string }) {
  const vehicle = useActiveVehicle();
  if (!vehicle || !fitsVehicle(product, vehicle)) return null;
  return (
    <span className={`s-badge ${className}`} data-tone="in" title={`Fits ${vehicle.make} ${vehicle.series}`}>
      <Check size={12} strokeWidth={2.5} /> Fits your {vehicle.nickname}
    </span>
  );
}

export const vehicleParams = (v: Pick<Vehicle, "make" | "series" | "year">) => {
  const params = new URLSearchParams({ make: v.make });
  if (v.series) params.set("model", v.series);
  if (v.year) params.set("year", v.year);
  return params.toString();
};

/** Header pill: shows the active truck and opens the garage panel. */
export function GarageButton() {
  const { garage } = useAppState();
  const vehicle = useActiveVehicle();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 max-w-[170px] items-center gap-2 rounded-full border border-[var(--s-line)] ps-2 pe-3 text-[13px] font-medium hover:border-[var(--s-text)]"
      >
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${vehicle ? "bg-[var(--s-green-soft)] text-[var(--s-green)]" : "bg-[var(--s-surface-2)] text-[var(--s-muted)]"}`}>
          <Truck size={13} />
        </span>
        <span className="truncate">{vehicle ? vehicle.nickname : "My Garage"}</span>
        {garage.length > 1 && <span className="tnum text-[11px] text-[var(--s-muted)]">+{garage.length - 1}</span>}
      </button>
      {open && (
        <div className="s-page absolute end-0 top-full z-50 mt-2 w-[340px] rounded-2xl border border-[var(--s-line)] bg-white p-4 shadow-[0_24px_60px_rgba(15,17,21,.16)]">
          <GaragePanel onDone={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

export function GaragePanel({ onDone }: { onDone?: () => void }) {
  const state = useAppState();
  const [adding, setAdding] = useState(state.garage.length === 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">My Garage</p>
        {onDone && (
          <button onClick={onDone} aria-label="Close garage" className="grid h-7 w-7 place-items-center rounded-md hover:bg-[var(--s-surface)]">
            <X size={16} />
          </button>
        )}
      </div>
      <p className="mt-0.5 text-[12.5px] text-[var(--s-muted)]">Save your trucks. Parts that fit the active one are marked across the shop.</p>

      {state.garage.length > 0 && (
        <ul className="mt-3 grid gap-1.5">
          {state.garage.map((v) => {
            const active = v.id === state.activeVehicleId;
            return (
              <li key={v.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${active ? "border-[var(--s-text)] bg-[var(--s-surface)]" : "border-[var(--s-line)]"}`}>
                <button className="min-w-0 flex-1 text-start" onClick={() => update((s) => setActiveVehicle(s, v.id))}>
                  <span className="block truncate text-[14px] font-semibold">{v.nickname}</span>
                  <span className="block truncate text-[12px] text-[var(--s-muted)]">
                    {[v.make, v.series, v.year].filter(Boolean).join(" · ")}
                    {v.vin && <span className="mono"> · {v.vin}</span>}
                  </span>
                </button>
                {active ? (
                  <Link href={`/parts?${vehicleParams(v)}`} onClick={onDone} className="s-btn" data-variant="primary" data-size="sm">
                    Parts
                  </Link>
                ) : (
                  <button className="s-btn" data-variant="ghost" data-size="sm" onClick={() => update((s) => setActiveVehicle(s, v.id))}>
                    Use
                  </button>
                )}
                <button aria-label={`Remove ${v.nickname}`} className="grid h-8 w-8 place-items-center rounded-md text-[var(--s-muted)] hover:bg-[var(--s-surface)] hover:text-[var(--s-red)]" onClick={() => update((s) => removeVehicle(s, v.id))}>
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {adding ? (
        <AddVehicleForm onSaved={() => setAdding(false)} onCancel={state.garage.length ? () => setAdding(false) : undefined} />
      ) : (
        <button className="s-btn mt-3 w-full" data-variant="outline" data-size="sm" onClick={() => setAdding(true)}>
          <Plus size={14} /> Add a truck
        </button>
      )}
    </div>
  );
}

export function AddVehicleForm({ onSaved, onCancel, initial }: { onSaved?: () => void; onCancel?: () => void; initial?: Partial<Vehicle> }) {
  const [make, setMake] = useState(initial?.make ?? "");
  const [series, setSeries] = useState(initial?.series ?? "");
  const [year, setYear] = useState(initial?.year ?? "");
  const truck = trucks.find((t) => t[0] === make);
  const seriesOptions = truck ? truck[1].split(" / ").map((s) => s.trim()) : [];
  const [from, to] = truck ? truck[2].split("–").map(Number) : [2010, 2024];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!make) return;
    const data = new FormData(event.currentTarget);
    update((s) =>
      saveVehicle(s, {
        make,
        series,
        year,
        nickname: String(data.get("nickname") ?? ""),
        vin: String(data.get("vin") ?? "").trim().toUpperCase() || undefined,
      }),
    );
    onSaved?.();
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-2.5 rounded-xl bg-[var(--s-surface)] p-3">
      <select aria-label="Make" className="s-select !h-10 bg-white" value={make} onChange={(e) => { setMake(e.target.value); setSeries(""); setYear(""); }} required>
        <option value="">Make</option>
        {trucks.map((t) => (
          <option key={t[0]}>{t[0]}</option>
        ))}
      </select>
      <div className="grid grid-cols-[1.3fr_1fr] gap-2">
        <select aria-label="Series" className="s-select !h-10 bg-white" value={series} onChange={(e) => setSeries(e.target.value)} disabled={!make}>
          <option value="">Any series</option>
          {seriesOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select aria-label="Year" className="s-select !h-10 bg-white" value={year} onChange={(e) => setYear(e.target.value)} disabled={!make}>
          <option value="">Year</option>
          {Array.from({ length: to - from + 1 }, (_, i) => String(to - i)).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>
      <input name="nickname" className="s-input !h-10 bg-white" placeholder="Nickname, e.g. Fleet #12 (optional)" defaultValue={initial?.nickname} />
      <input name="vin" className="s-input mono !h-10 bg-white uppercase" placeholder="VIN (optional)" maxLength={17} />
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" className="s-btn flex-1" data-variant="ghost" data-size="sm" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="s-btn flex-1" data-variant="primary" data-size="sm" disabled={!make}>
          Save truck
        </button>
      </div>
    </form>
  );
}
