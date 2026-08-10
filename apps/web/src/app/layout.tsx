import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pricy — Bill calculator",
  description:
    "Add menu items and get an instant estimate: tax, service charge, tip, and per-person split.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      {/* suppressHydrationWarning: silences harmless <body> attribute
          mismatches injected by browser extensions (e.g. Grammarly). */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
