import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/checkout-form";

export const metadata: Metadata = { title: "Checkout | Desert Route Truck Parts" };

export default function Page() {
  return <CheckoutForm />;
}
