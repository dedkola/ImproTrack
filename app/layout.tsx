import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Grid Tracker",
  description: "A responsive habit tracker with spreadsheet-style calendar grids."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
