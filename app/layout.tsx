import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-ui",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-ui",
});

export const metadata: Metadata = {
  title: "Momentum — Habit Tracker",
  description:
    "A responsive habit tracker with spreadsheet-style calendar grids.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
