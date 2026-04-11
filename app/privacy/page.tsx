import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/privacy-policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ImproTrack.",
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
