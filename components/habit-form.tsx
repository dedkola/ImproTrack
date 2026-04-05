"use client";

import { useEffect, useRef, useState } from "react";
import { HabitDefinition, HabitTone, TONE_PRESETS } from "@/lib/habits";

type HabitFormProps = {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<HabitDefinition, "id" | "slug" | "createdAt" | "archived">,
  ) => void;
  initial?: HabitDefinition | null;
  existingCategories: string[];
};

const EMOJI_SUGGESTIONS = [
  "💪",
  "🏃",
  "📖",
  "📚",
  "💊",
  "🧘",
  "🎯",
  "✍️",
  "💧",
  "🥗",
  "😴",
  "🧠",
  "🎵",
  "🌱",
  "🏋️",
  "🚶",
];

export function HabitForm({
  open,
  onClose,
  onSave,
  initial,
  existingCategories,
}: HabitFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [goalLabel, setGoalLabel] = useState("");
  const [unitLabel, setUnitLabel] = useState("days");
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [timeSlots, setTimeSlots] = useState<string[]>(["default"]);
  const [selectedToneIndex, setSelectedToneIndex] = useState(0);
  const nameId = "habit-name";
  const descriptionId = "habit-description";
  const categoryId = "habit-category";
  const categoryNewId = "habit-new-category";
  const goalId = "habit-goal";
  const unitId = "habit-unit";

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
      setName(initial.name);
      setDescription(initial.description);
      setIcon(initial.icon);
      setCategory(initial.category);
      setGoalLabel(initial.goalLabel);
      setUnitLabel(initial.unitLabel);
      setFrequencyPerDay(initial.frequencyPerDay);
      setTimeSlots([...initial.timeSlots]);
      const toneIdx = TONE_PRESETS.findIndex(
        (p) => p.tone.fill === initial.tone.fill,
      );
      setSelectedToneIndex(toneIdx >= 0 ? toneIdx : 0);
    } else {
      resetForm();
    }
  }, [initial, open]);

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("🎯");
    setCategory(existingCategories[0] ?? "");
    setNewCategory("");
    setGoalLabel("");
    setUnitLabel("days");
    setFrequencyPerDay(1);
    setTimeSlots(["default"]);
    setSelectedToneIndex(0);
  }

  function handleFrequencyChange(value: number) {
    const freq = Math.max(1, Math.min(10, value));
    setFrequencyPerDay(freq);
    if (freq === 1) {
      setTimeSlots(["default"]);
    } else {
      const defaults = ["Morning", "Afternoon", "Evening", "Night"];
      setTimeSlots(
        Array.from({ length: freq }, (_, i) =>
          i < timeSlots.length && timeSlots[i] !== "default"
            ? timeSlots[i]
            : (defaults[i] ?? `Slot ${i + 1}`),
        ),
      );
    }
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
      description: description.trim(),
      icon,
      category: finalCategory,
      unitLabel: unitLabel.trim() || "days",
      goalLabel: goalLabel.trim() || name.trim(),
      frequencyPerDay,
      timeSlots: frequencyPerDay === 1 ? ["default"] : timeSlots,
      tone: TONE_PRESETS[selectedToneIndex].tone,
    });
    resetForm();
    onClose();
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="modal-dialog m-auto w-full max-w-lg rounded-2xl border border-white/60 bg-white/90 p-0 shadow-[var(--shadow-panel)] backdrop-blur-2xl backdrop:bg-black/30 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3.5">
          <h2 className="text-[16px] font-semibold text-ink-950">
            {initial ? "Edit Habit" : "New Habit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close habit form"
            className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.06]"
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

        {/* Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* Icon picker */}
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`tap-target flex items-center justify-center rounded-lg text-[20px] transition ${
                    icon === emoji
                      ? "bg-ink-950 shadow-sm ring-2 ring-ink-950/20"
                      : "bg-black/[0.04] hover:bg-black/[0.08]"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value.slice(-2))}
                aria-label="Custom icon"
                className="h-11 w-16 rounded-lg border border-black/10 bg-white px-2 text-center text-[20px] placeholder:text-ink-500 focus:border-ink-950/30"
                maxLength={2}
              />
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
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor={descriptionId}
              className="mb-1.5 block text-[13px] font-medium text-ink-700"
            >
              Description
            </label>
            <textarea
              id={descriptionId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description"
              rows={2}
              className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
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
                className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 focus:border-ink-950/30"
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
                className="w-36 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
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
                  onClick={() => setSelectedToneIndex(index)}
                  className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition bg-linear-to-r ${preset.tone.surface} ${
                    selectedToneIndex === index
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
            </div>
          </div>

          {/* Goal label & Unit label */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={goalId}
                className="mb-1.5 block text-[13px] font-medium text-ink-700"
              >
                Goal label
              </label>
              <input
                id={goalId}
                type="text"
                value={goalLabel}
                onChange={(e) => setGoalLabel(e.target.value)}
                placeholder="e.g., Stay healthy"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
              />
            </div>
            <div>
              <label
                htmlFor={unitId}
                className="mb-1.5 block text-[13px] font-medium text-ink-700"
              >
                Unit label
              </label>
              <input
                id={unitId}
                type="text"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                placeholder="e.g., sessions"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
              />
            </div>
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
                      className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] px-5 py-3">
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
            className="pill-btn tap-target-compact rounded-lg bg-ink-950 px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:opacity-50"
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
      className="modal-dialog m-auto w-full max-w-sm rounded-2xl border border-white/60 bg-white/90 p-5 shadow-[var(--shadow-panel)] backdrop-blur-2xl backdrop:bg-black/30 backdrop:backdrop-blur-sm"
    >
      <h3 className="text-[15px] font-semibold text-ink-950">{title}</h3>
      <p className="mt-2 text-[13px] leading-5 text-ink-700">{message}</p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="pill-btn tap-target-compact rounded-lg px-4 py-2 text-[14px] font-medium text-ink-700 hover:bg-black/[0.04]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="pill-btn tap-target-compact rounded-lg bg-red-600 px-4 py-2 text-[14px] font-semibold text-white shadow-sm"
        >
          {confirmLabel ?? "Delete"}
        </button>
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

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        aria-label="Open habit actions"
        className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.08]"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-44 rounded-xl border border-black/[0.06] bg-white/90 py-1.5 shadow-[var(--shadow-panel)] backdrop-blur-2xl"
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
        </div>
      )}
    </div>
  );
}
