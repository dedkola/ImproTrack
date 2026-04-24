import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { PwaController } from "@/components/pwa-controller";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const sans = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-sans-ui",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-ui",
});

const siteUrl = getSiteUrl();
const metadataBase = new URL(siteUrl);
const title = "ImproTrack";
const description =
  "ImproTrack is a focused habit tracker for daily routines, streaks, archive history, and progress insights across your dashboard, stats, and archive views.";
const socialImage = `${siteUrl}/brand/dashboard-shot.png`;

export const metadata: Metadata = {
  metadataBase,
  applicationName: title,
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  referrer: "origin-when-cross-origin",
  keywords: [
    "habit tracker",
    "habit tracking app",
    "routine tracker",
    "streak tracker",
    "progress dashboard",
    "productivity PWA",
  ],
  creator: title,
  publisher: title,
  category: "productivity",
  classification: "Productivity",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  appleWebApp: {
    capable: true,
    title,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: title,
    locale: "en_US",
    title,
    description,
    images: [
      {
        url: socialImage,
        width: 3198,
        height: 2126,
        alt: "ImproTrack dashboard preview with habits, streaks, and weekly progress",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
  themeColor: "#6D28D9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="mask-icon"
          href="/safari-pinned-tab.svg"
          color="#6D28D9"
        />
      </head>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <FirebaseAnalytics />
        <I18nProvider>
          <FirebaseAuthProvider>
            <PwaController>{children}</PwaController>
          </FirebaseAuthProvider>
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
