import type { Metadata } from "next";
import { TermsOfServicePage } from "@/components/terms-of-service-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for ImproTrack. Covers acceptable use of the habit tracking app, user responsibilities, and the conditions governing your account and data.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <TermsOfServicePage />;
}
