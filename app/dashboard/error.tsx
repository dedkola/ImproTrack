"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-shell flex min-h-[60vh] items-center justify-center py-6">
      <section className="surface-panel flex w-full max-w-xl flex-col items-center gap-4 rounded-[28px] px-6 py-10 text-center sm:px-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-red-50 text-red-700">
          <AlertTriangle className="h-6 w-6" strokeWidth={1.8} />
        </span>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink-950">
            Dashboard hit a snag
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-ink-700">
            Something went wrong while rendering this dashboard view. Try the route again or head back to the main tracker.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="pill-btn tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2 text-[14px] font-semibold text-white shadow-[0_1px_3px_rgba(109,40,217,0.4)]"
          >
            <RefreshCcw className="h-4 w-4" strokeWidth={1.8} />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="pill-btn tap-target inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
