"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  ) => Promise<void> | void;
  initial?: HabitDefinition | null;
};

const SLOT_NAME_SUGGESTIONS = [
  "Morning",
  "Midday",
  "Afternoon",
  "Evening",
  "Night",
  "Late night",
];

function formatIconLabel(iconName: string) {
  return iconName.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function getSlotPlaceholder(index: number) {
  return SLOT_NAME_SUGGESTIONS[index] ?? `Check-in ${index + 1}`;
}

export function HabitForm({ open, onClose, onSave, initial }: HabitFormProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formId = useId();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goalLabel, setGoalLabel] = useState("");
  const [icon, setIcon] = useState("Target");
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [timeSlots, setTimeSlots] = useState<string[]>(["default"]);
  const [selectedToneIndex, setSelectedToneIndex] = useState(0);
  const [customHex, setCustomHex] = useState<string | null>(null);
  const [hexInput, setHexInput] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameId = `${formId}-habit-name`;
  const descriptionId = `${formId}-habit-description`;
  const goalLabelId = `${formId}-habit-goal-label`;
  const titleId = `${formId}-habit-title`;
  const introId = `${formId}-habit-intro`;
  const nameHelpId = `${nameId}-help`;
  const nameErrorId = `${nameId}-error`;
  const descriptionHelpId = `${descriptionId}-help`;
  const goalLabelHelpId = `${goalLabelId}-help`;
  const frequencyHelpId = `${formId}-frequency-help`;
  const slotHelpId = `${formId}-slot-help`;
  const iconHelpId = `${formId}-icon-help`;
  const colorHelpId = `${formId}-color-help`;

  const trimmedName = name.trim();
  const showNameError = attemptedSubmit && !trimmedName;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setAttemptedSubmit(false);

    if (initial) {
      const normalizedFrequency = getNormalizedFrequency(
        initial.frequencyPerDay,
        initial.timeSlots,
      );
      setName(initial.name);
      setDescription(initial.description ?? "");
      setGoalLabel(initial.goalLabel ?? "");
      setIcon(initial.icon);
      setFrequencyPerDay(normalizedFrequency);
      setTimeSlots(normalizeTimeSlots(normalizedFrequency, initial.timeSlots));
      if (initial.tone.hex) {
        setCustomHex(initial.tone.hex);
        setHexInput(initial.tone.hex);
        setSelectedToneIndex(-1);
      } else {
        const toneIdx = TONE_PRESETS.findIndex(
          (preset) => preset.tone.fill === initial.tone.fill,
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
    setDescription("");
    setGoalLabel("");
    setIcon("Target");
    setFrequencyPerDay(1);
    setTimeSlots(["default"]);
    setSelectedToneIndex(0);
    setCustomHex(null);
    setHexInput("");
    setAttemptedSubmit(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!trimmedName) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name: trimmedName,
        description: description.trim(),
        icon,
        unitLabel: "days",
        goalLabel: goalLabel.trim() || trimmedName,
        frequencyPerDay,
        timeSlots: normalizeTimeSlots(frequencyPerDay, timeSlots),
        tone:
          customHex !== null
            ? buildToneFromHex(customHex)
            : TONE_PRESETS[selectedToneIndex].tone,
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={introId}
      className="modal-dialog m-auto w-full max-w-2xl rounded-2xl border border-black/[0.1] bg-white p-0 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_20px_60px_rgba(10,22,40,0.18)] backdrop:bg-black/35 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-3.5">
          <div>
            <h2 id={titleId} className="text-[16px] font-semibold text-ink-950">
              {initial ? "Edit Habit" : "New Habit"}
            </h2>
            <p id={introId} className="mt-1 text-[12px] text-ink-600">
              Give it a name, choose a cue, and optionally describe the goal behind it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close habit form"
            className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto bg-white px-5 py-4">
          <fieldset>
            <legend className="text-[13px] font-medium text-ink-700">Icon</legend>
            <p id={iconHelpId} className="mt-1 text-[12px] leading-5 text-ink-600">
              Pick the symbol that will help you recognize this habit quickly. Currently selected: {formatIconLabel(icon)}.
            </p>
            <div className="mt-3 flex flex-wrap gap-2" aria-describedby={iconHelpId}>
              {HABIT_ICON_NAMES.map((iconName) => {
                const selected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    aria-pressed={selected}
                    aria-label={`Choose ${formatIconLabel(iconName)} icon`}
                    title={formatIconLabel(iconName)}
                    className={`tap-target flex items-center justify-center rounded-lg transition ${
                      selected
                        ? "bg-[#6D28D9] text-white shadow-sm ring-2 ring-[#6D28D9]/20"
                        : "bg-black/[0.04] text-ink-700 hover:bg-black/[0.08]"
                    }`}
                  >
                    <HabitIcon name={iconName} size={20} />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={nameId} className="mb-1.5 block text-[13px] font-medium text-ink-700">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Take vitamins"
                required
                aria-invalid={showNameError}
                aria-describedby={showNameError ? `${nameHelpId} ${nameErrorId}` : nameHelpId}
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30 ${
                  showNameError ? "border-rose-400" : "border-black/[0.16]"
                }`}
              />
              <p id={nameHelpId} className="mt-1.5 text-[12px] leading-5 text-ink-600">
                Keep it short and clear so it reads well in the tracker and sidebar.
              </p>
              {showNameError ? (
                <p id={nameErrorId} className="mt-1 text-[12px] font-medium text-rose-600">
                  Habit name is required.
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={descriptionId}
                className="mb-1.5 block text-[13px] font-medium text-ink-700"
              >
                Description <span className="text-ink-500">(optional)</span>
              </label>
              <textarea
                id={descriptionId}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                aria-describedby={descriptionHelpId}
                placeholder="Add a quick note so future-you remembers what counts."
                className="w-full rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
              />
              <p id={descriptionHelpId} className="mt-1.5 text-[12px] leading-5 text-ink-600">
                Useful for defining the habit or reminding yourself why it matters.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={goalLabelId}
                className="mb-1.5 block text-[13px] font-medium text-ink-700"
              >
                Goal label <span className="text-ink-500">(optional)</span>
              </label>
              <input
                id={goalLabelId}
                type="text"
                value={goalLabel}
                onChange={(e) => setGoalLabel(e.target.value)}
                aria-describedby={goalLabelHelpId}
                placeholder="e.g., Daily vitamins"
                className="w-full rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
              />
              <p id={goalLabelHelpId} className="mt-1.5 text-[12px] leading-5 text-ink-600">
                Shown as a compact label on detail screens. Leave blank to reuse the habit name.
              </p>
            </div>
          </div>

          <fieldset>
            <legend className="text-[13px] font-medium text-ink-700">Color</legend>
            <p id={colorHelpId} className="mt-1 text-[12px] leading-5 text-ink-600">
              Pick a preset or use a custom hex color to match the mood of this habit.
            </p>
            <div className="mt-3 flex flex-wrap gap-2" aria-describedby={colorHelpId}>
              {TONE_PRESETS.map((preset, index) => {
                const selected = selectedToneIndex === index && customHex === null;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedToneIndex(index);
                      setCustomHex(null);
                      setHexInput("");
                    }}
                    aria-pressed={selected}
                    className={`flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition bg-linear-to-r ${preset.tone.surface} ${
                      selected
                        ? "ring-2 ring-ink-950/20 shadow-sm"
                        : "hover:ring-1 hover:ring-black/10"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full ${preset.tone.fill}`} />
                    {preset.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  if (customHex === null) {
                    const nextColor = randomHabitColor();
                    setCustomHex(nextColor);
                    setHexInput(nextColor);
                  }
                  setSelectedToneIndex(-1);
                }}
                aria-pressed={customHex !== null}
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

            {customHex !== null && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <label className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-black/[0.12] transition hover:border-black/[0.24]">
                  <span className="h-6 w-6 rounded-md" style={{ backgroundColor: customHex }} />
                  <input
                    type="color"
                    value={customHex}
                    aria-label="Choose custom habit color"
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
                    let nextValue = e.target.value;
                    if (nextValue && !nextValue.startsWith("#")) nextValue = `#${nextValue}`;
                    setHexInput(nextValue);
                    if (isValidHex(nextValue)) {
                      setCustomHex(nextValue.toLowerCase());
                    }
                  }}
                  onBlur={() => {
                    if (customHex) setHexInput(customHex);
                  }}
                  aria-label="Custom color hex value"
                  placeholder="#3b82f6"
                  maxLength={7}
                  className="w-24 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 font-mono text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextColor = randomHabitColor();
                    setCustomHex(nextColor);
                    setHexInput(nextColor);
                  }}
                  aria-label="Choose a random custom color"
                  className="tap-target-compact flex items-center justify-center rounded-lg bg-black/[0.04] text-[16px] text-ink-700 hover:bg-black/[0.08]"
                >
                  🎲
                </button>
              </div>
            )}
          </fieldset>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
              Times per day
            </label>
            <div className="flex flex-wrap items-center gap-3" aria-describedby={frequencyHelpId}>
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
                {frequencyPerDay === 1 ? "Once a day" : `${frequencyPerDay} times a day`}
              </span>
            </div>
            <p id={frequencyHelpId} className="mt-1.5 text-[12px] leading-5 text-ink-600">
              Multi-slot habits unlock separate check-ins for each part of the day.
            </p>
          </div>

          {frequencyPerDay > 1 && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
                Time slot names
              </label>
              <p id={slotHelpId} className="mb-2.5 text-[12px] leading-5 text-ink-600">
                Customize each check-in label. Leave any blank and ImproTrack will fill it with a helpful default like Morning or Evening.
              </p>
              <div className="space-y-2" aria-describedby={slotHelpId}>
                {timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-5 text-center text-[12px] tabular-nums text-ink-600">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={slot}
                      onChange={(e) => handleSlotNameChange(index, e.target.value)}
                      placeholder={getSlotPlaceholder(index)}
                      className="flex-1 rounded-lg border border-black/[0.16] bg-white px-3 py-2.5 text-[14px] text-ink-950 placeholder:text-ink-500 focus:border-ink-950/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-white px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="pill-btn tap-target-compact rounded-lg px-4 py-2 text-[14px] font-medium text-ink-700 hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="pill-btn tap-target-compact rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? initial
                ? "Saving..."
                : "Creating..."
              : initial
                ? "Save changes"
                : "Create habit"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

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
      <div className="px-8 pb-10 pt-8">
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
  void tone;

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const menuItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
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

  function closeMenu(returnFocus = true) {
    setOpen(false);
    if (returnFocus) {
      window.requestAnimationFrame(() => buttonRef.current?.focus());
    }
  }

  function focusMenuItem(index: number) {
    const nextItem = menuItemRefs.current[index];
    nextItem?.focus();
  }

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();
    const frame = window.requestAnimationFrame(() => focusMenuItem(0));

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        closeMenu(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMenu();
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
      window.cancelAnimationFrame(frame);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const itemCount = menuItemRefs.current.length;
    if (itemCount === 0) return;

    const currentIndex = menuItemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusMenuItem((currentIndex + 1 + itemCount) % itemCount);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusMenuItem((currentIndex - 1 + itemCount) % itemCount);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusMenuItem(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusMenuItem(itemCount - 1);
    }
  }

  return (
    <div ref={ref} className="relative z-40">
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!open) updateMenuPosition();
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!open) {
              updateMenuPosition();
              setOpen(true);
            }
          }
        }}
        aria-label="Open habit actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="tap-target-compact flex items-center justify-center rounded-md text-ink-700 hover:bg-black/[0.08]"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Habit actions"
            onKeyDown={handleMenuKeyDown}
            className="fixed z-[250] w-44 rounded-xl border border-black/[0.08] bg-white py-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_28px_rgba(10,22,40,0.16)]"
            style={{ top: menuPos.top, left: menuPos.left }}
          >
            {[
              {
                label: "Edit",
                action: onEdit,
                className:
                  "flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-ink-700 hover:bg-black/[0.05]",
              },
              {
                label: "Archive",
                action: onArchive,
                className:
                  "flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-ink-700 hover:bg-black/[0.05]",
              },
              {
                label: "Delete",
                action: onDelete,
                className:
                  "flex min-h-10 w-full items-center gap-2 px-3 py-2 text-[14px] text-red-700 hover:bg-red-50/80",
              },
            ].map((item, index) => (
              <button
                key={item.label}
                ref={(element) => {
                  menuItemRefs.current[index] = element;
                }}
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  closeMenu();
                  item.action();
                }}
                className={item.className}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
