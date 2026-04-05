"use client";

import { useState } from "react";
import { Sidebar, SidebarToggle } from "@/components/sidebar";
import { Footer } from "@/components/footer";
import { HabitForm } from "@/components/habit-form";
import { useHabits } from "@/lib/storage";
import { HabitDefinition } from "@/lib/habits";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { activeHabits, categories, addHabit, updateHabit } = useHabits();

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

  return (
    <div className="flex min-h-screen">
      <Sidebar
        habits={activeHabits}
        categories={categories}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAddHabit={handleAddHabit}
      />

      <div className="flex flex-1 flex-col">
        {/* Mobile header bar with sidebar toggle */}
        <div className="header-bar sticky top-0 z-40 lg:hidden">
          <div className="page-shell flex h-14 items-center">
            <SidebarToggle onToggle={() => setSidebarOpen(true)} />
            <span className="ml-3 font-display text-[16px] font-semibold text-ink-950">
              Momentum
            </span>
          </div>
        </div>

        <main className="flex-1">{children}</main>

        <Footer />
      </div>

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
