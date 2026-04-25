"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  endOfMonth,
  parseDateKey,
  startOfMonth,
  toDateKey,
} from "@/lib/date";
import { useTranslation } from "@/components/i18n-provider";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = endOfMonth(first);
  // Monday = 0
  const startOffset = (first.getDay() + 6) % 7;
  const days: (Date | null)[] = [];

  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  return days;
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  label,
  size = "default",
  align = "left",
}: {
  value: string;
  onChange: (dateKey: string) => void;
  min?: string;
  max?: string;
  label?: string;
  size?: "default" | "compact";
  align?: "left" | "right";
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = parseDateKey(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  // Sync view when value changes externally
  useEffect(() => {
    const d = parseDateKey(value);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const grid = getMonthGrid(viewYear, viewMonth);

  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date(viewYear, viewMonth, 1));

  const displayLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(selected);

  const navigateMonth = useCallback(
    (delta: number) => {
      const d = new Date(viewYear, viewMonth + delta, 1);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    },
    [viewYear, viewMonth],
  );

  const isDisabled = (d: Date) => {
    const key = toDateKey(d);
    if (min && key < min) return true;
    if (max && key > max) return true;
    return false;
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const isSelected = (d: Date) => toDateKey(d) === value;

  const compact = size === "compact";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg transition ${
          compact ? "h-7 px-2.5 text-[11px]" : "min-h-10 px-3 py-2 text-[13px]"
        } bg-ink-950/[0.04] text-ink-700 hover:bg-ink-950/[0.08]`}
      >
        {label && <span className="font-medium">{label}</span>}
        <span className="text-ink-950 font-medium">{displayLabel}</span>
        <ChevronDown
          className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} text-ink-500`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-1.5 w-[272px] rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between pb-2.5">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-700 transition hover:bg-ink-950/[0.06]"
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="text-[13px] font-semibold text-ink-950">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-700 transition hover:bg-ink-950/[0.06]"
            >
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 pb-1">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="flex h-8 items-center justify-center text-[11px] font-medium text-ink-500"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="h-8" />;
              }

              const disabled = isDisabled(day);
              const sel = isSelected(day);
              const tod = isToday(day);

              return (
                <button
                  key={toDateKey(day)}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(toDateKey(day));
                    setOpen(false);
                  }}
                  className={`flex h-8 w-full items-center justify-center rounded-lg text-[12px] font-medium transition ${
                    sel
                      ? "bg-[#6D28D9] text-white shadow-[0_1px_3px_rgba(109,40,217,0.35)]"
                      : disabled
                        ? "text-ink-400 cursor-not-allowed"
                        : tod
                          ? "bg-ink-950/[0.06] text-ink-950 hover:bg-ink-950/[0.12]"
                          : "text-ink-800 hover:bg-ink-950/[0.06]"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="mt-2 border-t border-black/[0.04] pt-2">
            <button
              type="button"
              onClick={() => {
                const todayKey = toDateKey(new Date());
                if ((!min || todayKey >= min) && (!max || todayKey <= max)) {
                  onChange(todayKey);
                  setOpen(false);
                }
              }}
              className="w-full rounded-lg px-2 py-1.5 text-center text-[12px] font-medium text-ink-700 transition hover:bg-ink-950/[0.04]"
            >
              {t("date_today")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
