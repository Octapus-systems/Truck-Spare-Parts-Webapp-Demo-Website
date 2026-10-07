// My Garage: the customer's saved trucks. Pure.
import type { Product } from "../../data/products";
import type { AppState, Vehicle } from "./types";

const newId = () => globalThis.crypto.randomUUID();

/** Adds or updates a vehicle and makes it the active one. */
export function saveVehicle(state: AppState, vehicle: Omit<Vehicle, "id"> & { id?: string }): AppState {
  const id = vehicle.id ?? newId();
  const saved: Vehicle = {
    ...vehicle,
    id,
    nickname: vehicle.nickname.trim() || [vehicle.make, vehicle.series].filter(Boolean).join(" "),
  };
  const exists = state.garage.some((v) => v.id === id);
  return {
    ...state,
    garage: exists ? state.garage.map((v) => (v.id === id ? saved : v)) : [...state.garage, saved],
    activeVehicleId: id,
  };
}

export function removeVehicle(state: AppState, id: string): AppState {
  const garage = state.garage.filter((v) => v.id !== id);
  return {
    ...state,
    garage,
    activeVehicleId: state.activeVehicleId === id ? (garage[0]?.id ?? null) : state.activeVehicleId,
  };
}

export const setActiveVehicle = (state: AppState, id: string | null): AppState => ({
  ...state,
  activeVehicleId: id && state.garage.some((v) => v.id === id) ? id : null,
});

export const activeVehicle = (state: Pick<AppState, "garage" | "activeVehicleId">): Vehicle | null =>
  state.garage.find((v) => v.id === state.activeVehicleId) ?? null;

/** Same rule as the vehicle filter on /parts: make prefix, then series word if chosen. */
export const fitsVehicle = (product: Pick<Product, "fitment">, vehicle: Pick<Vehicle, "make" | "series">) =>
  product.fitment.some(
    (fit) => fit.startsWith(vehicle.make) && (!vehicle.series || fit.toLowerCase().includes(vehicle.series.toLowerCase())),
  );
