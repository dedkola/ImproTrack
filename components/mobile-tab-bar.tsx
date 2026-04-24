"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, BarChart2, LayoutGrid, Plus, Settings } from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";

type MobileTabBarProps = {
  onAddHabit: () => void;
};

function isTabActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/habits/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar({ onAddHabit }: MobileTabBarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const mobileTabs = [
    { href: "/dashboard", label: t("nav_dashboard"), icon: LayoutGrid },
    { href: "/dashboard/stats", label: t("nav_stats"), icon: BarChart2 },
    { href: "/dashboard/archive", label: t("nav_archive"), icon: Archive },
    { href: "/dashboard/settings", label: t("nav_settings"), icon: Settings },
  ] as const;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/92 backdrop-blur-2xl md:hidden"
    >
      <div className="page-shell relative py-2">
        <button
          type="button"
          onClick={onAddHabit}
          aria-label={t("tab_add_habit_aria")}
          className="pill-btn absolute right-4 top-0 z-10 inline-flex min-h-12 -translate-y-1/2 items-center gap-2 rounded-full bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_12px_32px_rgba(109,40,217,0.35)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.1} />
          {t("tab_add_habit")}
        </button>

        <div className="grid grid-cols-4 gap-1 rounded-[24px] border border-black/[0.05] bg-white/80 p-1 shadow-[0_-8px_24px_rgba(10,22,40,0.08)] pt-5">
          {mobileTabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[18px] px-1.5 py-1.5 text-center text-[10px] font-semibold leading-none transition-all sm:min-h-14 sm:gap-1 sm:px-2 sm:py-2 sm:text-[11px] ${
                  active
                    ? "bg-white text-ink-950 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04]"
                    : "text-ink-600 hover:bg-black/[0.04] hover:text-ink-950"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
