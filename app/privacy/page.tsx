import type { Metadata } from "next";
import { PrivacyPolicyPage } from "@/components/privacy-policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ImproTrack's privacy policy: what data we collect, how it's used, and how it's protected. We use Google sign-in only — no passwords, no ads, no data selling.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
