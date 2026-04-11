import type { Metadata } from "next";
import { TermsOfServicePage } from "@/components/terms-of-service-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for ImproTrack.",
};

export default function TermsPage() {
  return <TermsOfServicePage />;
}
