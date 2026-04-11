"use client";

import { useState } from "react";
import { AuthControls } from "@/components/auth-controls";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { HabitForm } from "@/components/habit-form";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { HabitStorageProvider, useHabits } from "@/lib/storage";
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
  const { activeHabits, categories, addHabit, updateHabit, isLoading, error } =
    useHabits();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitDefinition | null>(
    null,
  );

  const handleAddHabit = () => {
    setEditingHabit(null);
    setFormOpen(true);
  };

  const handleSave = (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, data);
    } else {
      addHabit(data);
    }
  };

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="header-bar sticky top-0 z-40">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <span className="font-display text-[15px] font-semibold text-ink-950 sm:text-[16px]">
              ImproTrack
            </span>
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
            <p className="text-[15px] text-ink-600">
              Loading your dashboard&hellip;
            </p>
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
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="surface-panel flex max-w-2xl flex-col items-center gap-4 rounded-[28px] px-8 py-10 text-center">
            <span className="text-[34px]">🔐</span>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink-950">
              Sign in to open your dashboard
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-ink-700">
              ImproTrack now stores habits per account, so the dashboard unlocks
              after you sign in with Google.
            </p>
            <AuthControls variant="panel" />
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="header-bar sticky top-0 z-40">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <span className="font-display text-[15px] font-semibold text-ink-950 sm:text-[16px]">
              ImproTrack
            </span>
          </div>
        </div>

        <main className="page-shell flex flex-1 items-center justify-center py-8">
          <div className="surface-panel flex max-w-2xl flex-col items-center gap-4 rounded-[28px] px-8 py-10 text-center">
            <span className="text-[34px]">⚠️</span>
            <h1 className="font-display text-[30px] font-semibold tracking-tight text-ink-950">
              Firestore is not ready yet
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-ink-700">
              {error}
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
      <Sidebar
        habits={activeHabits}
        categories={categories}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddHabit={handleAddHabit}
      />

      <div className="mobile-tab-shell flex min-w-0 flex-1 flex-col">
        {/* Mobile header bar with sidebar toggle */}
        <div className="header-bar sticky top-0 z-40 lg:hidden">
          <div className="page-shell flex h-[3.25rem] items-center sm:h-14">
            <SidebarToggle onToggle={() => setSidebarOpen(true)} />
            <span className="ml-2.5 font-display text-[15px] font-semibold text-ink-950 sm:ml-3 sm:text-[16px]">
              ImproTrack
            </span>
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>

        <Footer />
      </div>

      <MobileTabBar />

      <HabitForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSave}
        initial={editingHabit}
        existingCategories={categories}
      />
    </div>
  );
}
