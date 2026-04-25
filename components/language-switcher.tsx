"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGUAGES, type Locale } from "@/lib/i18n";
import { useTranslation } from "@/components/i18n-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={dropdownId}
        aria-label={t("language_select")}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-9 items-center gap-1.5 bg-transparent px-1 py-1.5 text-[12px] font-semibold text-ink-950 transition-colors hover:text-ink-700 sm:px-1.5 sm:text-[13px]"
      >
        <span aria-hidden="true" className="text-[14px] leading-none">
          {current.flag}
        </span>
        <span>{current.short}</span>
        <ChevronDown
          className={`h-3 w-3 text-ink-500 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id={dropdownId}
          role="listbox"
          aria-label={t("language_select")}
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_8px_32px_rgba(10,22,40,0.12)]"
        >
          <div className="max-h-[min(400px,80vh)] overflow-y-auto overscroll-contain p-1.5">
            {LANGUAGES.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                    isSelected
                      ? "bg-ink-950/[0.06] text-ink-950"
                      : "text-ink-700 hover:bg-black/[0.04] hover:text-ink-950"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[18px] leading-none"
                  >
                    {lang.flag}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[13px] font-semibold leading-tight">
                      {lang.label}
                    </span>
                    <span className="text-[11px] font-medium text-ink-500">
                      {lang.short}
                    </span>
                  </span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D28D9]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
