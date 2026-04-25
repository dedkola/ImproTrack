"use client";

import {
  LegalPage,
  type LegalHighlight,
  type LegalSection,
} from "@/components/legal-page";
import { useTranslation } from "@/components/i18n-provider";

const highlights: LegalHighlight[] = [
  {
    label: "Account data",
    value: "Google profile details needed to sign you in",
  },
  {
    label: "Habit data",
    value: "Stored to sync your dashboard, records, and settings",
  },
  {
    label: "Advertising",
    value: "No sale of personal data or habit-based ad targeting",
  },
];

const sections: LegalSection[] = [
  {
    title: "What this policy covers",
    paragraphs: [
      "ImproTrack is a habit-tracking service. This Privacy Policy explains what information may be processed when you visit the public website, sign in with Google, and use the dashboard to manage habits and progress.",
      "The service is designed to use only the information needed to operate the product. It is not built to sell user data or to use your habit entries for personalized advertising.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: [
      "If you sign in with Google, we may receive basic account details provided by Google, such as your name, email address, and profile image.",
      "When you use the app, we store the habits, schedules, archive state, completion records, and profile settings you choose to save so the product can function across sessions and devices.",
      "We may also receive limited technical and usage information, such as browser or device details, page views, and performance diagnostics, from the infrastructure and analytics services used to keep ImproTrack reliable.",
    ],
  },
  {
    title: "How we use information",
    paragraphs: [
      "We use information to authenticate your account, save and sync your habit data, render the dashboard correctly, maintain security, troubleshoot issues, and improve the stability and performance of the service.",
      "We may also use information when necessary to respond to support requests, enforce our Terms of Service, or comply with legal obligations.",
    ],
  },
  {
    title: "Sharing and service providers",
    paragraphs: [
      "ImproTrack relies on third-party service providers that support hosting, authentication, database storage, file storage, analytics, and performance monitoring. These providers may process information only as needed to operate the service on our behalf.",
      "We do not sell personal information. We may disclose information if required by law, to protect the security of the service, or to protect our users or legal rights.",
    ],
  },
  {
    title: "Retention and deletion",
    paragraphs: [
      "We keep account and habit data while it is reasonably needed to provide the service or satisfy legitimate operational and legal requirements.",
      "You can remove habit data through in-app controls where available. For account-level privacy or deletion requests, use the published support contact for the service.",
    ],
  },
  {
    title: "Security and children",
    paragraphs: [
      "Reasonable administrative and technical measures are used to protect information, but no system can be guaranteed to be perfectly secure.",
      "ImproTrack is not directed to children under 13, or the minimum age required by local law to consent to data processing in your jurisdiction.",
    ],
  },
  {
    title: "Changes to this policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we do, we will post the revised version here and update the last-updated date on this page.",
      "By continuing to use ImproTrack after changes become effective, you accept the updated Privacy Policy.",
    ],
  },
];

export function PrivacyPolicyPage() {
  const { t } = useTranslation();
  return (
    <LegalPage
      eyebrow={t("footer_privacy")}
      title={t("privacy_title")}
      intro={t("privacy_intro")}
      lastUpdated="April 11, 2026"
      highlights={highlights}
      sections={sections}
    />
  );
}
