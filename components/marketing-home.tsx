"use client";

import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";
import { useTranslation } from "@/components/i18n-provider";

const THEME_INVARIANT_PRIMARY_CTA_CLASS =
  "bg-[#0A1628] text-white shadow-[0_10px_24px_rgba(10,22,40,0.16)]";

export function MarketingHome() {
  const { t } = useTranslation();
  const quietPoints = [t("home_point_1"), t("home_point_2"), t("home_point_3")];
  const sectionNotes = [
    {
      id: "workspace",
      eyebrow: t("home_section_workspace_eyebrow"),
      title: t("home_section_workspace_title"),
      body: t("home_section_workspace_body"),
      image: "/brand/dashboard-shot.png",
      imageAlt: t("home_section_workspace_alt"),
      imagePriority: true,
    },
    {
      id: "signal",
      eyebrow: t("home_section_signal_eyebrow"),
      title: t("home_section_signal_title"),
      body: t("home_section_signal_body"),
      image: "/brand/stats-shot.png",
      imageAlt: t("home_section_signal_alt"),
      imagePriority: false,
    },
    {
      id: "system",
      eyebrow: t("home_section_system_eyebrow"),
      title: t("home_section_system_title"),
      body: t("home_section_system_body"),
      image: "/brand/archive-shot.png",
      imageAlt: t("home_section_system_alt"),
      imagePriority: false,
    },
  ];

  return (
    <PublicPageShell
      navLinks={[
        { href: "#workspace", label: t("home_nav_workspace") },
        { href: "#signal", label: t("home_nav_signal") },
        { href: "#system", label: t("home_nav_system") },
      ]}
      width="wide"
    >
      <section className="page-shell mx-auto max-w-5xl pt-12 pb-14 text-center sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
          ImproTrack
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-[44px] font-semibold leading-[0.94] tracking-tight text-ink-950 sm:text-[66px] lg:text-[88px]">
          {t("home_hero_title")}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-7 text-ink-700 sm:text-[19px] sm:leading-8">
          {t("home_hero_desc")}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className={`pill-btn inline-flex items-center justify-center rounded-xl px-5 py-3 text-[15px] font-semibold ${THEME_INVARIANT_PRIMARY_CTA_CLASS}`}
          >
            {t("home_open_dashboard")}
          </Link>
          <Link
            href="/privacy"
            className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
          >
            {t("home_review_privacy")}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[13px] font-medium text-ink-700 sm:mt-12">
          {quietPoints.map((point) => (
            <span
              key={point}
              className="rounded-full border border-black/[0.06] bg-white px-4 py-2 shadow-[var(--shadow-card)]"
            >
              {point}
            </span>
          ))}
        </div>
      </section>

      {sectionNotes.map((section, index) => {
        const isEven = index % 2 === 0;

        return (
          <section
            key={section.id}
            id={section.id}
            className="page-shell mx-auto max-w-6xl py-6 sm:py-8 lg:py-10"
          >
            <div
              className={`grid items-center gap-8 lg:gap-12 ${
                isEven
                  ? "lg:grid-cols-[0.9fr_1.1fr]"
                  : "lg:grid-cols-[1.1fr_0.9fr]"
              }`}
            >
              <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                  {section.eyebrow}
                </p>
                <h2 className="mt-3 max-w-xl font-display text-[34px] font-semibold tracking-tight text-ink-950 sm:text-[46px]">
                  {section.title}
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-8 text-ink-700 sm:text-[16px]">
                  {section.body}
                </p>
              </div>

              <figure
                className={`brand-shot-frame ${isEven ? "lg:order-2" : "lg:order-1"}`}
              >
                <Image
                  src={section.image}
                  alt={section.imageAlt}
                  width={1600}
                  height={1080}
                  priority={section.imagePriority}
                  className="brand-shot-image"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </figure>
            </div>
          </section>
        );
      })}

      <section className="page-shell mx-auto max-w-5xl py-8 pb-16 text-center sm:pb-20 lg:py-12">
        <div className="public-hero-panel rounded-[32px] px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
             {t("home_ready_label")}
          </p>
          <h2 className="mt-3 font-display text-[30px] font-semibold tracking-tight text-ink-950 sm:text-[42px]">
             {t("home_ready_title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-ink-700 sm:text-[16px] sm:leading-8">
            {t("home_ready_desc")}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="pill-btn inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              {t("home_go_to_dashboard")}
            </Link>
            <Link
              href="/terms"
              className="pill-btn inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-white px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              {t("home_read_terms")}
            </Link>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
