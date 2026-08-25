import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { TRPCProvider } from "@/trpc/react";

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
      <body suppressHydrationWarning>
        <TRPCProvider>
          {/* min-h-screen flex column keeps the footer at the bottom even on
              short pages; the subtle bg gives white cards a ground to sit on. */}
          <div className="flex min-h-screen flex-col bg-slate-50">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
