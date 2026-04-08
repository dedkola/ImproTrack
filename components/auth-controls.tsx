"use client";

import Link from "next/link";
import { useState } from "react";
import { Settings } from "lucide-react";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { signInWithGoogle, signOutFromFirebase } from "@/lib/firebase/auth";
import { ProfileSettingsModal } from "@/components/profile-settings-modal";

type AuthControlsProps = {
  variant?: "landing" | "sidebar" | "panel";
};

function getUserSummary(user: {
  displayName: string | null;
  email: string | null;
}) {
  const primary = user.displayName ?? user.email ?? "Signed in";
  const secondary = user.email ?? "Firebase account";
  const initial = primary.trim().charAt(0).toUpperCase() || "M";

  return { initial, primary, secondary };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function AuthControls({ variant = "landing" }: AuthControlsProps) {
  const { user, isLoading } = useFirebaseAuth();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { initial, primary, secondary } = getUserSummary({
    displayName: user?.displayName ?? null,
    email: user?.email ?? null,
  });

  const handleSignIn = async () => {
    setError(null);
    setIsPending(true);

    try {
      await signInWithGoogle();
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Google sign-in failed."));
    } finally {
      setIsPending(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setIsPending(true);

    try {
      await signOutFromFirebase();
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Sign-out failed."));
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "sidebar") {
    return (
      <>
        {isProfileOpen && (
          <ProfileSettingsModal onClose={() => setIsProfileOpen(false)} />
        )}
        <div className="rounded-2xl border border-black/[0.06] bg-white/88 px-3.5 py-3.5 shadow-[var(--shadow-card)] backdrop-blur-sm">
          {isLoading ? (
            <div className="space-y-2">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Account
              </p>
              <p className="text-[13px] text-ink-700">Checking session...</p>
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-10 w-10 rounded-xl object-cover border border-black/[0.08]"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3274C7] text-[14px] font-semibold text-white">
                    {initial}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink-950">
                    {primary}
                  </p>
                  <p className="truncate text-[12px] text-ink-600">
                    {secondary}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  aria-label="Profile settings"
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-black/[0.05] hover:text-ink-950 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  href="/dashboard"
                  className="pill-btn inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:bg-black/[0.02] hover:shadow-[var(--shadow-card-hover)]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={isPending}
                  className="pill-btn min-h-10 rounded-lg bg-[#3274C7] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-600">
                Account
              </p>
              <p className="mt-2 text-[13px] leading-6 text-ink-700">
                Sign in to sync your habits and records across devices.
              </p>
              <button
                type="button"
                onClick={() => void handleSignIn()}
                disabled={isPending}
                className="pill-btn mt-3 min-h-10 w-full rounded-lg bg-[#3274C7] px-3 py-2 text-[13px] font-semibold text-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Signing in..." : "Continue with Google"}
              </button>
            </>
          )}
          {error ? (
            <p className="mt-2 text-[12px] leading-5 text-red-700">{error}</p>
          ) : null}
        </div>
      </>
    );
  }

  if (variant === "panel") {
    return (
      <div className="flex flex-col items-center gap-3">
        {isLoading ? (
          <p className="text-[14px] text-ink-700">Checking session...</p>
        ) : user ? (
          <>
            <p className="text-[14px] text-ink-700">Signed in as {primary}.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/dashboard"
                className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3274C7] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(10,22,40,0.16)]"
              >
                Open dashboard
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isPending}
                className="pill-btn min-h-11 rounded-xl border border-black/[0.06] bg-white/88 px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void handleSignIn()}
              disabled={isPending}
              className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3274C7] px-5 py-3 text-[15px] font-semibold text-white shadow-[0_8px_24px_rgba(10,22,40,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing in..." : "Continue with Google"}
            </button>
            <Link
              href="/"
              className="pill-btn inline-flex min-h-11 items-center justify-center rounded-xl border border-black/[0.06] bg-white/88 px-5 py-3 text-[15px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              Back home
            </Link>
          </>
        )}
        {error ? (
          <p className="text-[12px] leading-5 text-red-700">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5 sm:items-stretch">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="hidden rounded-lg border border-black/[0.06] bg-white/70 px-3 py-2 text-[13px] font-semibold text-ink-600 shadow-[var(--shadow-card)] sm:inline-flex">
            Checking session...
          </span>
        ) : user ? (
          <>
            <div className="hidden items-center gap-3 rounded-lg border border-black/[0.06] bg-white/75 px-3 py-2 shadow-[var(--shadow-card)] sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3274C7] text-[12px] font-semibold text-white">
                {initial}
              </span>
              <div className="max-w-[180px] leading-tight">
                <p className="truncate text-[12px] font-semibold text-ink-950">
                  {primary}
                </p>
                <p className="truncate text-[11px] text-ink-600">{secondary}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isPending}
              className="pill-btn hidden rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-950 sm:inline-flex disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Signing out..." : "Sign out"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => void handleSignIn()}
            disabled={isPending}
            className="pill-btn hidden rounded-lg border border-black/[0.06] bg-white/70 px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:inline-flex disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Signing in..." : "Sign in with Google"}
          </button>
        )}
        <Link
          href="/dashboard"
          className="pill-btn inline-flex items-center rounded-lg border border-black/[0.06] bg-white/78 px-4 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)] backdrop-blur-sm hover:bg-white hover:shadow-[var(--shadow-card-hover)]"
        >
          Dashboard
        </Link>
      </div>
      {error ? (
        <p className="hidden text-right text-[12px] leading-5 text-red-700 sm:block">
          {error}
        </p>
      ) : null}
    </div>
  );
}
