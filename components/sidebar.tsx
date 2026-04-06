"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthControls } from "@/components/auth-controls";
import { HabitDefinition } from "@/lib/habits";

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
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-[13px] font-semibold text-white">
              M
            </span>
            <span className="font-display text-[16px] font-semibold text-ink-950">
              Momentum
            </span>
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close sidebar"
            className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.04] lg:hidden"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {/* Dashboard */}
          <NavItem
            href="/dashboard"
            label="Dashboard"
            icon={
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            }
            active={pathname === "/dashboard"}
          />

          {/* Habits section */}
          <div className="mt-5">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-600">
                Habits
              </span>
              <button
                type="button"
                onClick={onAddHabit}
                aria-label="Add habit"
                className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.06] hover:text-ink-950"
                title="Add habit"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </button>
            </div>

            <div className="mt-1 space-y-0.5">
              {habits.map((habit) => (
                <NavItem
                  key={habit.id}
                  href={`/dashboard/habits/${habit.slug}`}
                  label={habit.name}
                  icon={
                    <span className="text-[14px] leading-none">
                      {habit.icon}
                    </span>
                  }
                  active={pathname === `/dashboard/habits/${habit.slug}`}
                  badge={
                    <span
                      className={`h-2 w-2 rounded-full ${habit.tone.fill}`}
                    />
                  }
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

          {/* Archive & Settings */}
          <div className="mt-5 border-t border-black/[0.06] pt-3">
            <NavItem
              href="/dashboard/archive"
              label="Archive"
              icon={
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="12" height="3" rx="1" />
                  <path d="M3 6v6a1 1 0 001 1h8a1 1 0 001-1V6" />
                  <path d="M6.5 9h3" />
                </svg>
              }
              active={pathname === "/dashboard/archive"}
            />
            <NavItem
              href="/dashboard/stats"
              label="Statistics"
              icon={
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 13V8" />
                  <path d="M8 13V3" />
                  <path d="M13 13V6" />
                </svg>
              }
              active={pathname === "/dashboard/stats"}
            />
            <NavItem
              href="#"
              label="Settings"
              icon={
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="2.5" />
                  <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4" />
                </svg>
              }
              active={false}
              disabled
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
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: React.ReactNode;
  disabled?: boolean;
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

  return <Link href={href}>{content}</Link>;
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
      <svg
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M2 4h12M2 8h12M2 12h12" />
      </svg>
    </button>
  );
}
