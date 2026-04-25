"use client";

import {
  LegalPage,
  type LegalHighlight,
  type LegalSection,
} from "@/components/legal-page";
import { useTranslation } from "@/components/i18n-provider";

export function PrivacyPolicyPage() {
  const { t } = useTranslation();
  const highlights: LegalHighlight[] = [
    {
      label: t("privacy_highlight_account_data_label"),
      value: t("privacy_highlight_account_data_value"),
    },
    {
      label: t("privacy_highlight_habit_data_label"),
      value: t("privacy_highlight_habit_data_value"),
    },
    {
      label: t("privacy_highlight_advertising_label"),
      value: t("privacy_highlight_advertising_value"),
    },
  ];
  const sections: LegalSection[] = [
    {
      title: t("privacy_section_coverage_title"),
      paragraphs: [
        t("privacy_section_coverage_p1"),
        t("privacy_section_coverage_p2"),
      ],
    },
    {
      title: t("privacy_section_collect_title"),
      paragraphs: [
        t("privacy_section_collect_p1"),
        t("privacy_section_collect_p2"),
        t("privacy_section_collect_p3"),
      ],
    },
    {
      title: t("privacy_section_use_title"),
      paragraphs: [t("privacy_section_use_p1"), t("privacy_section_use_p2")],
    },
    {
      title: t("privacy_section_sharing_title"),
      paragraphs: [
        t("privacy_section_sharing_p1"),
        t("privacy_section_sharing_p2"),
      ],
    },
    {
      title: t("privacy_section_retention_title"),
      paragraphs: [
        t("privacy_section_retention_p1"),
        t("privacy_section_retention_p2"),
      ],
    },
    {
      title: t("privacy_section_security_title"),
      paragraphs: [
        t("privacy_section_security_p1"),
        t("privacy_section_security_p2"),
      ],
    },
    {
      title: t("privacy_section_changes_title"),
      paragraphs: [
        t("privacy_section_changes_p1"),
        t("privacy_section_changes_p2"),
      ],
    },
  ];

  return (
    <LegalPage
      eyebrow={t("footer_privacy")}
      title={t("privacy_title")}
      intro={t("privacy_intro")}
      lastUpdated={t("legal_last_updated_date")}
      highlights={highlights}
      sections={sections}
    />
  );
}
