import type { Metadata } from "next";
import { AdminTable } from "@/components/shop/admin-table";

export const metadata: Metadata = { title: "Admin | Desert Route Truck Parts" };

export default function Page() {
  return <AdminTable />;
}
