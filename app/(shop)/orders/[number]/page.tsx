import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/shop/order-confirmation";

export const metadata: Metadata = { title: "Your order | Desert Route Truck Parts" };

export default function Page() {
  return <OrderConfirmation />;
}
