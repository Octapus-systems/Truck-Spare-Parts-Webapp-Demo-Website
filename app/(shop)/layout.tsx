import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ShopShell } from "@/components/shop/shop-shell";
import "./shop.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-shop-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-shop-mono" });

export const metadata: Metadata = {
  title: "Desert Route Truck Parts | Commercial vehicle parts in the UAE",
  description: "Search truck parts by part number, OE number or vehicle. Live stock, verified fitment, same-day dispatch.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopShell className={`${sans.variable} ${mono.variable}`}>{children}</ShopShell>;
}
