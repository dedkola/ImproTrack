"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslation } from "@/components/i18n-provider";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({
  className = "",
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const label = isDark ? t("theme_dark") : t("theme_light");
  const ariaLabel = isDark
    ? t("theme_switch_to_light")
    : t("theme_switch_to_dark");

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className={`pill-btn theme-toggle-pill tap-target-compact inline-flex items-center gap-2 rounded-lg border border-black/[0.06] px-3 py-2 text-[13px] font-semibold shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)] ${className}`}
    >
      {isDark ? (
        <Moon className="h-4 w-4" strokeWidth={1.8} />
      ) : (
        <Sun className="h-4 w-4" strokeWidth={1.8} />
      )}
      {showLabel ? <span>{label}</span> : null}
    </button>
  );
}
