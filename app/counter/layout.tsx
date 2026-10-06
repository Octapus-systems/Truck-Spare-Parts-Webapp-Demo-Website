import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./counter.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-counter-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-counter-mono" });

export const metadata: Metadata = {
  title: "Parts Counter | Desert Route",
  description: "Keyboard-first parts catalogue and billing for counter staff.",
};

export default function CounterLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${inter.variable} ${mono.variable} counter`}>{children}</div>;
}
