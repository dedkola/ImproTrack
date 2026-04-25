import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { FirebaseAuthProvider } from "@/components/firebase-auth-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { PwaController } from "@/components/pwa-controller";
import { ThemeProvider } from "@/components/theme-provider";
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
const siteName = "ImproTrack";
const title = "ImproTrack: Habit Dashboard for Routines and Progress";
const description =
  "ImproTrack is a focused habit tracker for daily routines, streaks, archive history, and progress insights across your dashboard, stats, and archive views.";
const socialImage = `${siteUrl}/brand/opengraph.png`;

export const metadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: {
    default: title,
    template: `%s | ${siteName}`,
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
  creator: siteName,
  publisher: siteName,
  category: "productivity",
  classification: "Productivity",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    locale: "en_US",
    title,
    description,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: "ImproTrack preview collage with the home page, dashboard matrix, and statistics view",
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
  colorScheme: "light dark",
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
          <ThemeProvider>
            <FirebaseAuthProvider>
              <PwaController>{children}</PwaController>
            </FirebaseAuthProvider>
          </ThemeProvider>
        </I18nProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
