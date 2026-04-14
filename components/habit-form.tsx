"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreVertical, X } from "lucide-react";
import {
  getNormalizedFrequency,
  HABIT_ICON_NAMES,
  HabitDefinition,
  HabitTone,
  normalizeTimeSlots,
  TONE_PRESETS,
} from "@/lib/habits";
import {
  buildToneFromHex,
  isValidHex,
  randomHabitColor,
} from "@/lib/tone-utils";
import { HabitIcon } from "@/components/habit-icon";

type HabitFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => void;
  initial?: HabitDefinition | null;
  existingCategories: string[];
};

export function HabitForm({
  open,
  onClose,
  onSave,
  initial,
  existingCategories,
}: HabitFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Target");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [timeSlots, setTimeSlots] = useState<string[]>(["default"]);
  const [selectedToneIndex, setSelectedToneIndex] = useState(0);
  const [customHex, setCustomHex] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("");
  const nameId = "habit-name";
  const categoryId = "habit-category";
  const categoryNewId = "habit-new-category";

  // Sync dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  // Pre-fill when editing
  useEffect(() => {
    if (initial) {
      const normalizedFrequency = getNormalizedFrequency(
        initial.frequencyPerDay,
        initial.timeSlots,
      );
      setName(initial.name);
      setIcon(initial.icon);
      setCategory(initial.category);
      setFrequencyPerDay(normalizedFrequency);
      setTimeSlots(normalizeTimeSlots(normalizedFrequency, initial.timeSlots));
      if (initial.tone.hex) {
        setCustomHex(initial.tone.hex);
        setHexInput(initial.tone.hex);
        setSelectedToneIndex(-1);
      } else {
        const toneIdx = TONE_PRESETS.findIndex(
          (p) => p.tone.fill === initial.tone.fill,
        );
        setSelectedToneIndex(toneIdx >= 0 ? toneIdx : 0);
        setCustomHex(null);
        setHexInput("");
      }
    } else {
      resetForm();
    }
  }, [initial, open]);

  function resetForm() {
    setName("");
    setIcon("Target");
    setCategory(existingCategories[0] ?? "");
    setNewCategory("");
    setFrequencyPerDay(1);
    setTimeSlots(["default"]);
    setSelectedToneIndex(0);
    setCustomHex(null);
    setHexInput("");
  }

  function handleFrequencyChange(value: number) {
    const freq = Math.max(1, Math.min(10, value));
    setFrequencyPerDay(freq);
    setTimeSlots((current) => normalizeTimeSlots(freq, current));
  }

  function handleSlotNameChange(index: number, value: string) {
    setTimeSlots((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = newCategory.trim() || category || "General";

    onSave({
      name: name.trim(),
      description: "",
      icon,
      category: finalCategory,
      unitLabel: "days",
      goalLabel: name.trim(),
      frequencyPerDay,
      timeSlots: normalizeTimeSlots(frequencyPerDay, timeSlots),
      tone:
        customHex !== null
          ? buildToneFromHex(customHex)
          : TONE_PRESETS[selectedToneIndex].tone,
    });
    resetForm();
    onClose();
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="modal-dialog m-auto w-full max-w-lg rounded-2xl border border-black/[0.1] bg-white p-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_20px_60px_rgba(10,22,40,0.18)] backdrop:bg-black/35 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-3.5">
          <h2 className="text-[16px] font-semibold text-ink-950">
            {initial ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close habit form"
            className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.06]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto bg-white px-5 py-4">
          {/* Icon picker */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  className={`tap-target flex items-center justify-center rounded-lg transition ${
                    icon === name
                      ? "bg-[#6D28D9] text-white shadow-sm ring-2 ring-[#6D28D9]/20"
                      : "bg-black/[0.04] text-ink-700 hover:bg-black/[0.08]"
                  }`}
                >
                  <HabitIcon name={name} size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor={nameId}
              className="mb-1.5 block text-[13px] font-medium text-ink-700"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Take vitamins"
              required
              className="w-full rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor={categoryId}
              className="mb-1.5 block text-[13px] font-medium text-ink-700"
            >
              Category
            </label>
            <div className="flex gap-2">
              <select
                id={categoryId}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setNewCategory("");
                }}
                className="flex-1 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 focus:border-ink-950/30"
              >
                <option value="">Select or type new</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                id={categoryNewId}
                type="text"
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setCategory("");
                }}
                placeholder="New category"
                className="w-36 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
              />
            </div>
          </div>

          {/* Color theme */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {TONE_PRESETS.map((preset, index) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSelectedToneIndex(index);
                    setCustomHex(null);
                    setHexInput("");
                  }}
                  className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition bg-linear-to-r ${preset.tone.surface} ${
                    selectedToneIndex === index && customHex === null
                      ? "ring-2 ring-ink-950/20 shadow-sm"
                      : "hover:ring-1 hover:ring-black/10"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded-full ${preset.tone.fill}`}
                  />
                  {preset.label}
                </button>
              ))}

              {/* Custom color swatch */}
              <button
                type="button"
                onClick={() => {
                  if (customHex === null) {
                    const c = randomHabitColor();
                    setCustomHex(c);
                    setHexInput(c);
                  }
                  setSelectedToneIndex(-1);
                }}
                className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition ${
                  customHex !== null
                    ? "ring-2 ring-ink-950/20 shadow-sm"
                    : "hover:ring-1 hover:ring-black/10"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={
                    customHex
                      ? { backgroundColor: customHex }
                      : {
                          backgroundImage:
                            "conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)",
                        }
                  }
                />
                Custom
              </button>
            </div>

            {/* Expanded custom color controls */}
            {customHex !== null && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-black/[0.12] transition hover:border-black/[0.24]">
                  <span
                    className="h-6 w-6 rounded-md"
                    style={{ backgroundColor: customHex }}
                  />
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      const nextHex = e.target.value.toLowerCase();
                      setCustomHex(nextHex);
                      setHexInput(nextHex);
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    tabIndex={-1}
                  />
                </label>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    let v = e.target.value;
                    if (v && !v.startsWith("#")) v = "#" + v;
                    setHexInput(v);
                    if (isValidHex(v)) {
                      setCustomHex(v.toLowerCase());
                    }
                  }}
                  onBlur={() => {
                    if (customHex) setHexInput(customHex);
                  }}
                  placeholder="#3b82f6"
                  maxLength={7}
                  className="w-24 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 font-mono text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const c = randomHabitColor();
                    setCustomHex(c);
                    setHexInput(c);
                  }}
                  title="Random color"
                  className="tap-target-compact flex items-center justify-center rounded-lg bg-black/[0.04] text-[16px] text-ink-700 hover:bg-black/[0.08]"
                >
                  🎲
                </button>
              </div>
            )}
          </div>

          {/* Frequency per day */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Times per day
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleFrequencyChange(frequencyPerDay - 1)}
                aria-label="Decrease frequency"
                className="tap-target-compact flex items-center justify-center rounded-lg bg-black/[0.04] text-ink-700 hover:bg-black/[0.08]"
              >
                −
              </button>
              <span className="w-9 text-center font-display text-[16px] font-semibold tabular-nums text-ink-950">
                {frequencyPerDay}
              </span>
              <button
                type="button"
                onClick={() => handleFrequencyChange(frequencyPerDay + 1)}
                aria-label="Increase frequency"
                className="tap-target-compact flex items-center justify-center rounded-lg bg-black/[0.04] text-ink-700 hover:bg-black/[0.08]"
              >
                +
              </button>
              <span className="text-[13px] text-ink-700">
                {frequencyPerDay === 1
                  ? "Once a day"
                  : `${frequencyPerDay} times a day`}
              </span>
            </div>
          </div>

          {/* Time slot names (only when freq > 1) */}
          {frequencyPerDay > 1 && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
                Time slot names
              </label>
              <div className="space-y-2">
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 text-center text-[12px] tabular-nums text-ink-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={slot}
                      onChange={(e) =>
                        handleSlotNameChange(index, e.target.value)
                      }
                      placeholder={`Slot ${index + 1}`}
                      className="flex-1 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="pill-btn tap-target-compact rounded-lg px-4 py-2 text-[14px] font-medium text-ink-700 hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="pill-btn tap-target-compact rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)] disabled:opacity-50"
          >
            {initial ? "Save changes" : "Create habit"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

/** Simple confirm dialog for delete actions */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      className="modal-dialog m-auto w-full max-w-lg rounded-2xl border border-black/[0.08] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_24px_80px_rgba(10,22,40,0.22)] backdrop:bg-black/35 backdrop:backdrop-blur-sm"
    >
      <div className="px-8 pt-8 pb-10">
        <h3 className="text-[17px] font-semibold text-ink-950">{title}</h3>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-600">{message}</p>
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-black/[0.12] bg-white px-5 py-2.5 text-[14px] font-medium text-ink-700 transition-colors hover:bg-black/[0.04]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
          >
            {confirmLabel ?? "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Overflow menu for habit cards (edit / archive / delete) */
export function HabitMenu({
  tone,
  onEdit,
  onArchive,
  onDelete,
}: {
  tone?: HabitTone;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  function updateMenuPosition() {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 136;
    const gap = 8;

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    const openUp = rect.bottom + gap + menuHeight > window.innerHeight - 8;
    const top = openUp
      ? Math.max(8, rect.top - menuHeight - gap)
      : rect.bottom + gap;

    setMenuPos({ top, left });
  }

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    function handleViewportChange() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative z-40">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!open) updateMenuPosition();
          setOpen(!open);
        }}
        aria-label="Open habit actions"
        className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.08]"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-[250] w-44 rounded-xl border border-black/[0.08] bg-white py-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_28px_rgba(10,22,40,0.16)]"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onEdit();
              }}
              className="flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-ink-700 hover:bg-black/[0.05]"
            >
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onArchive();
              }}
              className="flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-ink-700 hover:bg-black/[0.05]"
            >
              Archive
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                onDelete();
              }}
              className="flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-red-700 hover:bg-red-50/80"
            >
              Delete
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
