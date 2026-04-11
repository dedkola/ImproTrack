"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  BarChart2,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { ProfileSettingsCard } from "@/components/profile-settings-card";
import { useFirebaseAuth } from "@/components/firebase-auth-provider";
import { signOutFromFirebase } from "@/lib/firebase/auth";

export function DashboardSettings() {
  const { user } = useFirebaseAuth();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setError(null);
    setIsPending(true);

    try {
      await signOutFromFirebase();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Sign-out failed.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="page-shell flex flex-col gap-4 py-5">
      <header className="animate-fade-in-up surface-panel rounded-[28px] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-ink-700">
              Settings
            </span>
            <h1 className="mt-4 font-display text-[30px] font-semibold tracking-tight text-ink-950 sm:text-[40px]">
              Keep your account and phone navigation tidy.
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-7 text-ink-700">
              Update your profile, keep important routes one tap away, and
              manage the account behind your synced habits without digging
              through the drawer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-ink-950 shadow-[var(--shadow-card)]">
              {user?.email ?? "ImproTrack account"}
            </span>
            <Link
              href="/dashboard"
              className="pill-btn tap-target-compact inline-flex items-center rounded-lg bg-white px-4 py-2 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-card-hover)]"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <ProfileSettingsCard
          title="Profile"
          description="Change the name and avatar shown in your drawer, settings, and future shared surfaces."
        />

        <div className="flex flex-col gap-4">
          <section className="animate-fade-in-up surface-panel rounded-[28px] p-5 sm:p-6">
            <div>
              <h2 className="text-[14px] font-semibold text-ink-950">
                Quick routes
              </h2>
              <p className="mt-1 text-[13px] leading-6 text-ink-700">
                Phones now keep the main sections in the bottom tab bar. These
                shortcuts stay here for larger screens and fallback navigation.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SettingsLinkCard
                href="/dashboard"
                title="Dashboard"
                detail="Return to the live habit board."
                icon={<LayoutGrid className="h-4 w-4" strokeWidth={1.8} />}
              />
              <SettingsLinkCard
                href="/dashboard/stats"
                title="Statistics"
                detail="Open the trend and leaderboard view."
                icon={<BarChart2 className="h-4 w-4" strokeWidth={1.8} />}
              />
              <SettingsLinkCard
                href="/dashboard/archive"
                title="Archive"
                detail="Review paused habits and restore them."
                icon={<Archive className="h-4 w-4" strokeWidth={1.8} />}
              />
            </div>
          </section>

          <section className="animate-fade-in-up surface-panel rounded-[28px] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-ink-950">
                  Account access
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-ink-700">
                  {user?.email
                    ? `Signed in as ${user.email}.`
                    : "Your dashboard syncs through your Google account."}
                </p>
              </div>
              <span className="rounded-full bg-ink-950/[0.05] px-3 py-1 text-[12px] font-semibold text-ink-700">
                Synced
              </span>
            </div>

            <div className="mt-5 rounded-[24px] border border-black/[0.06] bg-white px-4 py-4 shadow-[var(--shadow-card)]">
              <p className="text-[13px] leading-6 text-ink-700">
                Signing out only disconnects this device until you continue with
                Google again.
              </p>
              {error ? (
                <p className="mt-3 text-[12px] leading-5 text-red-700">
                  {error}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={isPending}
                className="pill-btn mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_8px_28px_rgba(109,40,217,0.38)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.8} />
                {isPending ? "Signing out..." : "Sign out"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingsLinkCard({
  href,
  title,
  detail,
  icon,
}: {
  href: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[24px] border border-black/[0.06] bg-white p-4 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-950/[0.05] text-ink-950">
          {icon}
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-ink-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-950"
          strokeWidth={1.8}
        />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold text-ink-950">{title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-ink-700">{detail}</p>
    </Link>
  );
}
