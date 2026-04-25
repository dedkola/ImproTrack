"use client";

import { useState } from "react";
import { AuthControls } from "@/components/auth-controls";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { HabitForm } from "@/components/habit-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslation } from "@/components/i18n-provider";
import {
  HabitStorageProvider,
  type HabitStorageSyncState,
  useHabits,
} from "@/lib/storage";
import { HabitDefinition } from "@/lib/habits";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <HabitStorageProvider>
      <AppShellContent>{children}</AppShellContent>
    </HabitStorageProvider>
  );
}

function AppShellContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useFirebaseAuth();
  const {
    activeHabits,
    addHabit,
    updateHabit,
    isLoading,
    bootstrapError,
    syncState,
  } = useHabits();
  const { t } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(null);

  const handleAddHabit = () => {
    setEditingHabit(null);
    setSidebarOpen(false);
    setFormOpen(true);
  };

  const handleSave = async (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, data);
      return;
    }

    await addHabit(data);
  };

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="header-bar sticky top-0 z-40">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <span className="font-display text-[15px] font-semibold text-ink-950 sm:text-[16px]">
              ImproTrack
            </span>
            <ThemeToggle className="ml-auto" showLabel={false} />
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
            <p className="text-[15px] text-ink-600">{t("app_loading")}</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="header-bar sticky top-0 z-40">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <span className="font-display text-[15px] font-semibold text-ink-950 sm:text-[16px]">
              ImproTrack
            </span>
            <ThemeToggle className="ml-auto" showLabel={false} />
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="surface-panel flex max-w-2xl flex-col items-center gap-4 rounded-[28px] px-8 py-10 text-center">
            <span className="text-[34px]">🔐</span>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink-950">
              {t("app_sign_in_title")}
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-ink-700">
              {t("app_sign_in_description")}
            </p>
            <AuthControls variant="panel" />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="header-bar sticky top-0 z-40">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <span className="font-display text-[15px] font-semibold text-ink-950 sm:text-[16px]">
              ImproTrack
            </span>
            <ThemeToggle className="ml-auto" showLabel={false} />
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="surface-panel flex max-w-2xl flex-col items-center gap-4 rounded-[28px] px-8 py-10 text-center">
            <span className="text-[34px]">⚠️</span>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink-950">
              {t("app_firestore_not_ready")}
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-ink-700">
              {bootstrapError.message}
            </p>
            <AuthControls variant="panel" />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-0">
      <a
        href="#dashboard-main"
        className="sr-only z-[120] rounded-xl bg-ink-950 px-4 py-2 text-[14px] font-semibold text-white shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t("skip_to_dashboard")}
      </a>

      <Sidebar
        habits={activeHabits}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddHabit={handleAddHabit}
      />

      <div className="mobile-tab-shell flex min-w-0 flex-1 flex-col">
        <div className="header-bar sticky top-0 z-40 lg:hidden">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <SidebarToggle onToggle={() => setSidebarOpen(true)} />
            <span className="ml-2.5 font-display text-[15px] font-semibold text-ink-950 sm:ml-3 sm:text-[16px]">
              ImproTrack
            </span>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher />
              <ThemeToggle showLabel={false} />
            </div>
          </div>
        </div>

        {syncState.latestIssue ? (
          <div className="page-shell pt-3 sm:pt-4">
            <SyncStatusBanner syncState={syncState} />
          </div>
        ) : null}

        <main id="dashboard-main" className="min-w-0 flex-1">
          {children}
        </main>

        <Footer />
      </div>

      <MobileTabBar onAddHabit={handleAddHabit} />

      <HabitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        initial={editingHabit}
      />
    </div>
  );
}

function SyncStatusBanner({
  syncState,
}: {
  syncState: HabitStorageSyncState;
}) {
  const { t } = useTranslation();
  const issueTitle =
    syncState.latestIssue?.kind === "listener"
      ? syncState.latestIssue.source === "records"
        ? t("banner_records_sync")
        : t("banner_habits_sync")
      : t("banner_last_change");
  return (
    <div className="grid gap-2">
      {syncState.latestIssue ? (
        <div
          role="alert"
          className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-red-950 shadow-[var(--shadow-card)]"
        >
          <p className="text-[13px] font-semibold">{issueTitle}</p>
          <p className="mt-1 text-[12px] leading-5 text-red-900/85">
            {syncState.latestIssue.message}
          </p>
        </div>
      ) : null}
    </div>
  );
}

