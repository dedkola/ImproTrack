import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider";
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
  title: {
    default: "ImproTrack",
    template: "%s | ImproTrack",
  },
  description:
    "ImproTrack — a focused habit tracker with a calm homepage, dashboard, archive, and statistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <FirebaseAnalytics />
        <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
