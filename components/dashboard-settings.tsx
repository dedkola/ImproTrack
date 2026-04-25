"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BarChart2,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { ProfileSettingsCard } from "@/components/profile-settings-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { useHabits } from "@/lib/storage";
import { signOutFromFirebase } from "@/lib/firebase/auth";
import { useTranslation } from "@/components/i18n-provider";
import type { Translations } from "@/lib/i18n";

type TFn = (key: keyof Translations, params?: Record<string, string>) => string;

export function DashboardSettings() {
  const { user } = useFirebaseAuth();
  const { syncState } = useHabits();
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncSummary = getSyncSummary(syncState, t);

  const handleSignOut = async () => {
    setError(null);
    setIsPending(true);

    try {
      await signOutFromFirebase();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : t("auth_sign_out"),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="page-shell flex flex-col gap-3 py-3.5 sm:gap-4 sm:py-5">
      <header className="animate-fade-in-up surface-panel rounded-[28px] px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-700">
              {t("settings_tag")}
            </span>
            <h1 className="mt-3 font-display text-[24px] font-semibold tracking-tight text-ink-950 sm:mt-4 sm:text-[40px]">
              {t("settings_heading")}
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-ink-700 sm:hidden">
              {t("settings_heading_desc_mobile")}
            </p>
            <p className="mt-3 hidden max-w-2xl text-[15px] leading-7 text-ink-700 sm:block">
              {t("settings_heading_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:text-[13px]">
              {user?.email ?? t("settings_account_email_fallback")}
            </span>
            <Link
              href="/dashboard"
              className="pill-btn tap-target-compact inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] sm:text-[14px]"
            >
              {t("settings_back")}
            </Link>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:hidden">
          <div className="rounded-[22px] border border-black/[0.06] bg-white px-4 py-3 shadow-[var(--shadow-card)]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {t("settings_account_snapshot")}
            </p>
            <p className="mt-2 text-[14px] font-semibold text-ink-950">
              {syncSummary.statusLabel}
            </p>
            <p className="mt-1 text-[12px] leading-5 text-ink-600">
              {syncSummary.shortDetail}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-3.5 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4">
        <ProfileSettingsCard
          title={t("auth_profile")}
          description={t("settings_profile_desc")}
        />

        <div className="flex flex-col gap-3.5 sm:gap-4">
          <section className="animate-fade-in-up surface-panel rounded-[28px] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-ink-950">
                  {t("settings_appearance")}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-ink-700 sm:leading-6">
                  {t("settings_appearance_desc")}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className="animate-fade-in-up surface-panel rounded-[28px] p-4 sm:p-6">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                {t("settings_quick_routes")}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-ink-700 sm:leading-6">
                {t("settings_quick_routes_desc")}
              </p>
            </div>

            <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-2 sm:gap-3">
              <SettingsLinkCard
                href="/dashboard"
                title={t("nav_dashboard")}
                detail={t("settings_dashboard_detail")}
                icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.8} />}
              />
              <SettingsLinkCard
                href="/dashboard/stats"
                title={t("nav_stats")}
                detail={t("settings_stats_detail")}
                icon={<BarChart2 className="h-4 w-4" strokeWidth={1.8} />}
              />
              <SettingsLinkCard
                href="/dashboard/archive"
                title={t("nav_archive")}
                detail={t("settings_archive_detail")}
                icon={<Archive className="h-4 w-4" strokeWidth={1.8} />}
              />
            </div>
          </section>

          <section className="animate-fade-in-up surface-panel rounded-[28px] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-ink-950">
                  {t("settings_sync_health")}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-ink-700 sm:leading-6">
                  {t("settings_sync_desc")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${syncSummary.badgeClass}`}
              >
                {syncSummary.statusLabel}
              </span>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/[0.06] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-[14px] font-semibold text-ink-950">
                {syncSummary.title}
              </p>
              <p className="mt-1 text-[13px] leading-6 text-ink-700">
                {syncSummary.detail}
              </p>

              <div className="mt-4 grid gap-2 text-[12px] leading-5 text-ink-700">
                <p>
                  {t("settings_pending_records")}:{" "}
                  <span className="font-semibold text-ink-950">
                    {syncState.pendingRecordCount}
                  </span>
                </p>
                <p>
                  {t("settings_active_saves")}:{" "}
                  <span className="font-semibold text-ink-950">
                    {syncState.pendingMutationCount}
                  </span>
                </p>
                {syncState.latestMutationError ? (
                  <p className="text-red-700">
                    {t("settings_last_save_error")}: {syncState.latestMutationError.message}
                  </p>
                ) : null}
                {syncState.latestIssue?.kind === "listener" ? (
                  <p className="text-red-700">
                    {t("settings_live_sync_warning", { source: syncState.latestIssue.source })}:{" "}
                    {syncState.latestIssue.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up surface-panel rounded-[28px] p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-ink-950">
                  {t("settings_account_access")}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-ink-700 sm:leading-6">
                  {user?.email
                    ? t("auth_signed_in_as", { name: user.email })
                    : t("settings_account_fallback")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[12px] font-semibold ${syncSummary.badgeClass}`}
              >
                {syncSummary.statusLabel}
              </span>
            </div>

            <div className="mt-4 rounded-[24px] border border-black/[0.06] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-[13px] leading-6 text-ink-700">
                {t("auth_sign_out_info")}
              </p>
              {error ? (
                <p className="mt-3 text-[12px] leading-5 text-red-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isPending}
                className="pill-btn mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(109,40,217,0.38)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                {isPending ? t("auth_signing_out") : t("auth_sign_out")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsLinkCard({
  href,
  title,
  detail,
  icon,
}: {
  href: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-black/[0.06] bg-white p-3.5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-ink-950/[0.05] text-ink-950 sm:h-10 sm:w-10">
          {icon}
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-ink-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-950"
          strokeWidth={1.8}
        />
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-ink-950">{title}</h3>
      <p className="mt-1.5 text-[13px] leading-5 text-ink-700 sm:leading-6">
        {detail}
      </p>
    </Link>
  );
}

function getSyncSummary(
  syncState: ReturnType<typeof useHabits>["syncState"],
  t: TFn,
) {
  if (syncState.latestIssue) {
    return {
      statusLabel: t("sync_needs_attention"),
      badgeClass: "bg-red-100 text-red-700",
      title:
        syncState.latestIssue.kind === "listener"
          ? t("sync_title_attention_listener")
          : t("sync_title_attention_mutation"),
      detail: syncState.latestIssue.message,
      shortDetail: t("sync_detail_attention"),
    };
  }

  if (syncState.isSyncing) {
    return {
      statusLabel: t("sync_saving"),
      badgeClass: "bg-sky-100 text-sky-700",
      title: t("sync_title_saving"),
      detail:
        syncState.pendingRecordCount > 0
          ? t("sync_detail_saving_records")
          : t("sync_detail_saving_habits"),
      shortDetail: t("sync_short_saving"),
    };
  }

  return {
    statusLabel: t("sync_synced"),
    badgeClass: "bg-emerald-100 text-emerald-700",
    title: t("sync_title_synced"),
    detail: t("sync_detail_synced"),
    shortDetail: t("sync_short_synced"),
  };
}


