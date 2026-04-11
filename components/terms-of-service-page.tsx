import {
  LegalPage,
  type LegalHighlight,
  type LegalSection,
} from "@/components/legal-page";

const highlights: LegalHighlight[] = [
  {
    label: "License",
    value: "Personal, non-exclusive use of the service",
  },
  {
    label: "Your data",
    value: "You keep ownership of what you submit",
  },
  {
    label: "Availability",
    value: "Provided as-is and may change over time",
  },
];

const sections: LegalSection[] = [
  {
    title: "Acceptance of these terms",
    paragraphs: [
      "By accessing or using ImproTrack, you agree to these Terms of Service. If you do not agree, do not use the service.",
      "These terms apply to the public website, Google sign-in flow, dashboard, archive, statistics, and related features made available through ImproTrack.",
    ],
  },
  {
    title: "Eligibility and account responsibilities",
    paragraphs: [
      "You are responsible for using the service lawfully and for maintaining the security of the Google account you use to sign in.",
      "You must provide accurate information where required and must not impersonate another person or access another user&apos;s account without authorization.",
    ],
  },
  {
    title: "Permitted use",
    paragraphs: [
      "You may use ImproTrack for personal habit tracking and related productivity purposes.",
      "You may not interfere with the service, attempt unauthorized access, distribute malicious code, scrape or abuse the product at scale, or use the service in a way that violates law or the rights of others.",
    ],
  },
  {
    title: "Your content and data",
    paragraphs: [
      "You keep ownership of the habits, records, profile information, and other content you submit to ImproTrack.",
      "You grant us a limited permission to host, process, store, back up, and display that content only as needed to operate, secure, and improve the service.",
    ],
  },
  {
    title: "Service changes and availability",
    paragraphs: [
      "ImproTrack may change, suspend, or discontinue features at any time. We do not guarantee that the service will always be available, uninterrupted, or error-free.",
      "We may update the product to improve functionality, security, or compliance, including changes that affect how features behave or are presented.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access if we reasonably believe you are misusing the service, creating security or legal risk, or violating these terms.",
      "You may stop using the service at any time.",
    ],
  },
  {
    title: "Disclaimers",
    paragraphs: [
      "ImproTrack is provided on an as-is and as-available basis. To the maximum extent permitted by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, and uninterrupted availability.",
      "The service is intended as a general productivity tool and does not provide medical, legal, financial, or professional advice.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted by law, ImproTrack and its operators will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of data, profits, goodwill, or business opportunity arising from your use of the service.",
      "If liability cannot be excluded, it will be limited to the minimum amount permitted under applicable law.",
    ],
  },
  {
    title: "Changes to these terms",
    paragraphs: [
      "We may revise these Terms of Service from time to time. When we do, we will post the updated version here and update the last-updated date on this page.",
      "Your continued use of ImproTrack after changes become effective means you accept the revised terms.",
    ],
  },
];

export function TermsOfServicePage() {
  return (
    <LegalPage
      eyebrow="Terms of Service"
      title="Clear rules for using ImproTrack."
      intro="These terms are intentionally short and practical. They explain how you may use the service, what stays yours, and the limits of the product as provided today."
      lastUpdated="April 11, 2026"
      highlights={highlights}
      sections={sections}
    />
  );
}
