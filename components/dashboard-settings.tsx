"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
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
    <div className="page-shell mx-auto flex w-full max-w-5xl flex-col gap-4 py-4 sm:gap-5 sm:py-6">
      <header className="animate-fade-in-up flex items-center justify-between gap-4 px-0.5 py-1">
        <div>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink-950 sm:text-[32px]">
            {t("settings_tag")}
          </h1>
          <p className="mt-1 text-[13px] text-ink-600">
            {user?.email ?? t("settings_account_email_fallback")}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="pill-btn tap-target-compact inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] sm:px-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span className="hidden sm:inline">{t("settings_back")}</span>
        </Link>
      </header>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:gap-5">
        <ProfileSettingsCard
          title={t("auth_profile")}
          description=""
        />

        <div className="flex min-w-0 flex-col gap-4">
          <section className="animate-fade-in-up surface-panel min-w-0 overflow-hidden rounded-[20px] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[15px] font-semibold text-ink-950">
                  {t("settings_appearance")}
                </h2>
              </div>
              <ThemeToggle />
            </div>
          </section>

          <section className="animate-fade-in-up surface-panel min-w-0 overflow-hidden rounded-[20px] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink-950">
                  {t("settings_account_access")}
                </h2>
                <p className="mt-1 truncate text-[13px] text-ink-600">
                  {user?.email ?? t("settings_account_fallback")}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${syncSummary.badgeClass}`}
              >
                {syncSummary.statusLabel}
              </span>
            </div>

            {syncState.latestIssue ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] leading-5 text-red-800"
              >
                {syncState.latestIssue.message}
              </div>
            ) : null}

            <div className="mt-4 border-t border-black/[0.06] pt-4">
              {error ? (
                <p className="mb-3 text-[12px] leading-5 text-red-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isPending}
                className="pill-btn inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

function getSyncSummary(
  syncState: ReturnType<typeof useHabits>["syncState"],
  t: TFn,
) {
  if (syncState.latestIssue) {
    return {
      statusLabel: t("sync_needs_attention"),
      badgeClass: "bg-red-100 text-red-700",
    };
  }

  if (syncState.isSyncing) {
    return {
      statusLabel: t("sync_saving"),
      badgeClass: "bg-sky-100 text-sky-700",
    };
  }

  return {
    statusLabel: t("sync_synced"),
    badgeClass: "bg-emerald-100 text-emerald-700",
  };
}
