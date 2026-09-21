import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desert Route Truck Parts | Demo UAE Catalogue",
  description: "Synthetic-data demo for a UAE commercial vehicle spare-parts catalogue, fitment and RFQ platform.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AE">
      <body className="antialiased">{children}</body>
    </html>
  );
}
