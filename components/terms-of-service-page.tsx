"use client";

import {
  LegalPage,
  type LegalHighlight,
  type LegalSection,
} from "@/components/legal-page";
import { useTranslation } from "@/components/i18n-provider";

export function TermsOfServicePage() {
  const { t } = useTranslation();
  const highlights: LegalHighlight[] = [
    {
      label: t("terms_highlight_license_label"),
      value: t("terms_highlight_license_value"),
    },
    {
      label: t("terms_highlight_data_label"),
      value: t("terms_highlight_data_value"),
    },
    {
      label: t("terms_highlight_availability_label"),
      value: t("terms_highlight_availability_value"),
    },
  ];
  const sections: LegalSection[] = [
    {
      title: t("terms_section_acceptance_title"),
      paragraphs: [
        t("terms_section_acceptance_p1"),
        t("terms_section_acceptance_p2"),
      ],
    },
    {
      title: t("terms_section_eligibility_title"),
      paragraphs: [
        t("terms_section_eligibility_p1"),
        t("terms_section_eligibility_p2"),
      ],
    },
    {
      title: t("terms_section_permitted_title"),
      paragraphs: [
        t("terms_section_permitted_p1"),
        t("terms_section_permitted_p2"),
      ],
    },
    {
      title: t("terms_section_content_title"),
      paragraphs: [
        t("terms_section_content_p1"),
        t("terms_section_content_p2"),
      ],
    },
    {
      title: t("terms_section_changes_availability_title"),
      paragraphs: [
        t("terms_section_changes_availability_p1"),
        t("terms_section_changes_availability_p2"),
      ],
    },
    {
      title: t("terms_section_termination_title"),
      paragraphs: [
        t("terms_section_termination_p1"),
        t("terms_section_termination_p2"),
      ],
    },
    {
      title: t("terms_section_disclaimers_title"),
      paragraphs: [
        t("terms_section_disclaimers_p1"),
        t("terms_section_disclaimers_p2"),
      ],
    },
    {
      title: t("terms_section_liability_title"),
      paragraphs: [
        t("terms_section_liability_p1"),
        t("terms_section_liability_p2"),
      ],
    },
    {
      title: t("terms_section_revisions_title"),
      paragraphs: [
        t("terms_section_revisions_p1"),
        t("terms_section_revisions_p2"),
      ],
    },
  ];

  return (
    <LegalPage
      eyebrow={t("footer_terms")}
      title={t("terms_title")}
      intro={t("terms_intro")}
      lastUpdated={t("legal_last_updated_date")}
      highlights={highlights}
      sections={sections}
    />
  );
}
