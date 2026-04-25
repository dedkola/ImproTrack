"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { LANGUAGES, type Locale } from "@/lib/i18n";
import { useTranslation } from "@/components/i18n-provider";

const MENU_WIDTH = 208;
const MENU_MAX_HEIGHT = 400;
const MENU_MIN_HEIGHT = 180;
const MENU_GAP = 8;
const VIEWPORT_MARGIN = 8;

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownId = useId();
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    width: MENU_WIDTH,
    maxHeight: MENU_MAX_HEIGHT,
  });

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(MENU_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(rect.right - width, viewportWidth - width - VIEWPORT_MARGIN),
    );
    const belowSpace =
      viewportHeight - rect.bottom - MENU_GAP - VIEWPORT_MARGIN;
    const aboveSpace = rect.top - MENU_GAP - VIEWPORT_MARGIN;
    const openUp = belowSpace < MENU_MIN_HEIGHT && aboveSpace > belowSpace;
    const availableHeight = Math.max(
      MENU_MIN_HEIGHT,
      openUp ? aboveSpace : belowSpace,
    );
    const maxHeight = Math.min(MENU_MAX_HEIGHT, availableHeight);
    const top = openUp
      ? Math.max(VIEWPORT_MARGIN, rect.top - maxHeight - MENU_GAP)
      : rect.bottom + MENU_GAP;

    setMenuPos({ top, left, width, maxHeight });
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  function handleSelect(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
        aria-label={t("language_select")}
        onClick={() => {
          if (!open) updateMenuPosition();
          setOpen((v) => !v);
        }}
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

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={dropdownId}
            role="listbox"
            aria-label={t("language_select")}
            className="fixed z-[250] overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_8px_32px_rgba(10,22,40,0.12)]"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
            }}
          >
            <div
              className="overflow-y-auto overscroll-contain p-1.5"
              style={{ maxHeight: menuPos.maxHeight }}
            >
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
          </div>,
          document.body,
        )}
    </div>
  );
}
