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
        <div className="grid grid-cols-4 gap-1 rounded-[24px] bg-white/70 p-1 shadow-[var(--shadow-card)]">
          {mobileTabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = tab.icon;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center text-[11px] font-semibold transition-colors ${
                  active
                    ? "bg-ink-950/[0.06] text-ink-950"
                    : "text-ink-600 hover:bg-black/[0.04] hover:text-ink-950"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
