import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pricy Admin — Menu moderation",
  description:
    "Internal tools: submit and edit restaurants and menus, moderate submissions, and run AI menu import.",
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
