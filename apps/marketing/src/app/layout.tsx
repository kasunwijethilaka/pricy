import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pricy — Know the bill before you order",
  description:
    "Browse restaurant menus with real prices and estimate your bill: tax, service charge, tip, and per-person split.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      {/*
        suppressHydrationWarning: browser extensions (e.g. Grammarly) inject
        attributes like data-gr-ext-installed onto <body> before React
        hydrates, causing a harmless server/client attribute mismatch.
        This flag silences the warning for THIS element's attributes only
        (one level deep) — it is not a blanket "ignore all hydration bugs".
      */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
