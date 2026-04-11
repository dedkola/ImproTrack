"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, BarChart2, LayoutGrid, Settings } from "lucide-react";

const mobileTabs = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutGrid,
  },
  {
    href: "/dashboard/stats",
    label: "Stats",
    icon: BarChart2,
  },
  {
    href: "/dashboard/archive",
    label: "Archive",
    icon: Archive,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" || pathname.startsWith("/dashboard/habits/")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="mobile-tab-bar fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-white/92 backdrop-blur-2xl md:hidden"
    >
      <div className="page-shell py-2">
        <div className="grid grid-cols-4 gap-1 rounded-[24px] border border-black/[0.05] bg-white/80 p-1 shadow-[0_-8px_24px_rgba(10,22,40,0.08)]">
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
