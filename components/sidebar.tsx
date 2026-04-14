"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BarChart2,
  LayoutGrid,
  Menu,
  Plus,
  Settings,
} from "lucide-react";
import { AuthControls } from "@/components/auth-controls";
import { HabitIcon } from "@/components/habit-icon";
import { HabitDefinition } from "@/lib/habits";
import { accentClass, accentStyle, fillClass, fillStyle } from "@/lib/tone-utils";

type SidebarProps = {
  habits: HabitDefinition[];
  categories: string[];
  isOpen: boolean;
  onToggle: () => void;
  onAddHabit: () => void;
};

export function Sidebar({
  habits,
  categories,
  isOpen,
  onToggle,
  onAddHabit,
}: SidebarProps) {
  const pathname = usePathname();
  const closeOnMobile = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024 && isOpen) {
      onToggle();
    }
  };

  const handleAddHabit = () => {
    onAddHabit();
    closeOnMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-black/[0.06] bg-white/80 backdrop-blur-2xl transition-transform duration-300 ease-out lg:sticky lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center justify-between border-b border-black/[0.06] px-4">
          <Link
            href="/dashboard"
            onClick={closeOnMobile}
            className="flex items-center gap-2.5"
          >
            <img
              src="/logo.svg"
              alt="ImproTrack"
              className="h-11 w-11"
            />
            <span className="font-display text-[24px] font-semibold text-ink-950">
              ImproTrack
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close sidebar"
            className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.04] lg:hidden"
          >
            <svg
              viewBox="0 0 18 18"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
            >
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="rounded-[24px] border border-black/[0.06] bg-white px-3 py-3 shadow-[var(--shadow-card)] lg:hidden">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              Quick actions
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddHabit}
                className="pill-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Add habit
              </button>
              <Link
                href="/dashboard/settings"
                onClick={closeOnMobile}
                className="pill-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
              >
                <Settings className="h-3.5 w-3.5" strokeWidth={1.8} />
                Settings
              </Link>
            </div>
          </div>

          <div className="mt-5 hidden lg:block">
            <NavItem
              href="/dashboard"
              label="Dashboard"
              icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.5} />}
              active={pathname === "/dashboard"}
              onClick={closeOnMobile}
            />
          </div>

          {/* Habits section */}
          <div className="mt-5">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-600">
                Habits
              </span>
              <button
                type="button"
                onClick={handleAddHabit}
                aria-label="Add habit"
                className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.06] hover:text-ink-950"
                title="Add habit"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              {habits.map((habit) => (
                <NavItem
                  key={habit.id}
                  href={`/dashboard/habits/${habit.slug}`}
                  label={habit.name}
                  icon={
                    <HabitIcon
                      name={habit.icon}
                      size={14}
                      className={accentClass(habit.tone)}
                      style={accentStyle(habit.tone)}
                    />
                  }
                  active={pathname === `/dashboard/habits/${habit.slug}`}
                  badge={
                    <span
                      className={`h-2 w-2 rounded-full ${fillClass(habit.tone)}`}
                      style={fillStyle(habit.tone)}
                    />
                  }
                  onClick={closeOnMobile}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mt-5">
              <span className="px-2 py-1 text-[12px] font-semibold uppercase tracking-wider text-ink-600">
                Categories
              </span>
              <div className="mt-1 space-y-0.5">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[14px] text-ink-700"
                  >
                    <span className="flex h-4 w-4 items-center justify-center text-[11px]">
                      #
                    </span>
                    <span>{cat}</span>
                    <span className="ml-auto text-[12px] tabular-nums text-ink-600">
                      {habits.filter((h) => h.category === cat).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archive & Stats */}
          <div className="mt-5 hidden border-t border-black/[0.06] pt-3 lg:block">
            <NavItem
              href="/dashboard/archive"
              label="Archive"
              icon={<Archive className="h-4 w-4" strokeWidth={1.5} />}
              active={pathname === "/dashboard/archive"}
              onClick={closeOnMobile}
            />
            <NavItem
              href="/dashboard/stats"
              label="Statistics"
              icon={<BarChart2 className="h-4 w-4" strokeWidth={1.5} />}
              active={pathname === "/dashboard/stats"}
              onClick={closeOnMobile}
            />
            <NavItem
              href="/dashboard/settings"
              label="Settings"
              icon={<Settings className="h-4 w-4" strokeWidth={1.5} />}
              active={pathname === "/dashboard/settings"}
              onClick={closeOnMobile}
            />
          </div>
        </nav>

        <div className="border-t border-black/[0.06] p-3">
          <AuthControls variant="sidebar" />
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  icon,
  active,
  badge,
  disabled,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <div
      className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-medium transition-colors ${
        active
          ? "bg-ink-950/[0.06] text-ink-950"
          : disabled
            ? "cursor-not-allowed text-ink-500"
            : "text-ink-700 hover:bg-black/[0.04] hover:text-ink-950"
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="truncate">{label}</span>
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );

  if (disabled) {
    return content;
  }

  return (
    <Link href={href} onClick={onClick}>
      {content}
    </Link>
  );
}

/** Hamburger button for mobile — placed in the header */
export function SidebarToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Open sidebar"
      className="tap-target flex items-center justify-center rounded-lg text-ink-700 hover:bg-black/[0.04] lg:hidden"
    >
      <Menu className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}
