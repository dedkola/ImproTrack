"use client";

import Link from "next/link";
import { ArchiveRestore, X } from "lucide-react";
import { useEffect } from "react";

type ArchiveFeedbackProps = {
  habitName: string | null;
  open: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  archiveHref?: string;
};

export function ArchiveFeedback({
  habitName,
  open,
  onUndo,
  onDismiss,
  archiveHref = "/dashboard/archive",
}: ArchiveFeedbackProps) {
  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [open, onDismiss]);

  if (!open || !habitName) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-[140] px-4 md:bottom-6"
    >
      <div className="mx-auto flex max-w-lg items-start gap-3 rounded-[24px] border border-black/[0.08] bg-white/96 px-4 py-3.5 shadow-[0_20px_50px_rgba(10,22,40,0.16)] backdrop-blur-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink-950/[0.05] text-ink-950">
          <ArchiveRestore className="h-4 w-4" strokeWidth={1.8} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-ink-950">
            "{habitName}" moved to archive.
          </p>
          <p className="mt-1 text-[13px] leading-5 text-ink-700">
            Undo if you still want it in your active tracker.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onUndo}
              className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_20px_rgba(109,40,217,0.3)]"
            >
              Undo archive
            </button>
            <Link
              href={archiveHref}
              className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white px-3.5 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              Open archive
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss archive message"
          className="tap-target-compact inline-flex items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-black/[0.05] hover:text-ink-950"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
