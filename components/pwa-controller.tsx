"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

const INSTALL_DISMISS_KEY = "improtrack-install-dismissed";

function isStandaloneDisplayMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (
      window.navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true
  );
}

function isIosSafariInstallable() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIosDevice =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);
  const isSafari = /safari/.test(userAgent);
  const isOtherIosBrowser = /crios|fxios|edgios|opios/.test(userAgent);

  return isIosDevice && isSafari && !isOtherIosBrowser;
}

export function PwaController() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installMode, setInstallMode] = useState<"browser" | "ios" | null>(
    null,
  );
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsOnline(window.navigator.onLine);
    setIsInstalled(isStandaloneDisplayMode());
    setIsDismissed(window.localStorage.getItem(INSTALL_DISMISS_KEY) === "1");

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();

      if (
        window.localStorage.getItem(INSTALL_DISMISS_KEY) === "1" ||
        isStandaloneDisplayMode()
      ) {
        return;
      }

      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setInstallMode("browser");
    };

    const handleAppInstalled = () => {
      window.localStorage.removeItem(INSTALL_DISMISS_KEY);
      setInstallPromptEvent(null);
      setInstallMode(null);
      setIsDismissed(false);
      setIsInstalled(true);
      setIsInstalling(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );
    window.addEventListener("appinstalled", handleAppInstalled);

    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch(() => {
          return undefined;
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted || isInstalled || isDismissed) {
      setInstallMode(null);
      return;
    }

    if (installPromptEvent) {
      setInstallMode("browser");
      return;
    }

    if (isIosSafariInstallable()) {
      setInstallMode("ios");
      return;
    }

    setInstallMode(null);
  }, [hasMounted, installPromptEvent, isDismissed, isInstalled]);

  const dismissInstallCard = () => {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setIsDismissed(true);
    setInstallPromptEvent(null);
    setInstallMode(null);
  };

  const installFromPrompt = async () => {
    if (!installPromptEvent) {
      return;
    }

    setIsInstalling(true);

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;

      if (outcome !== "accepted") {
        setIsInstalling(false);
      }
    } catch {
      setIsInstalling(false);
    } finally {
      setInstallPromptEvent(null);
    }
  };

  if (!hasMounted) {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm sm:left-auto sm:right-6">
        <div
          aria-live="polite"
          className="pointer-events-auto rounded-[24px] border border-black/[0.08] bg-white/95 px-4 py-4 shadow-[var(--shadow-panel)] backdrop-blur-xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
            Offline mode
          </p>
          <p className="mt-2 text-[14px] leading-6 text-ink-950">
            Cached pages stay available, but Google sign-in and live habit sync
            need a network connection.
          </p>
        </div>
      </div>
    );
  }

  if (isInstalled || isDismissed || !installMode) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm sm:left-auto sm:right-6">
      <aside className="pointer-events-auto rounded-[24px] border border-black/[0.08] bg-white/95 px-4 py-4 shadow-[var(--shadow-panel)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              Install ImproTrack
            </p>
            <h2 className="mt-2 font-display text-[22px] font-semibold tracking-tight text-ink-950">
              Keep your dashboard close at hand.
            </h2>
            <p className="mt-2 text-[14px] leading-6 text-ink-700">
              {installMode === "browser"
                ? "Install ImproTrack for a focused, app-like workspace with faster repeat visits and an offline fallback."
                : "On iPhone or iPad, open Safari’s Share sheet and choose Add to Home Screen to install ImproTrack."}
            </p>
          </div>

          <button
            type="button"
            onClick={dismissInstallCard}
            aria-label="Dismiss install prompt"
            className="tap-target-compact inline-flex flex-shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[18px] leading-none text-ink-500 shadow-[var(--shadow-card)] transition-colors hover:text-ink-950"
          >
            ×
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {installMode === "browser" ? (
            <>
              <button
                type="button"
                onClick={() => void installFromPrompt()}
                disabled={isInstalling}
                className="pill-btn min-h-11 rounded-xl bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-3 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(109,40,217,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isInstalling ? "Opening prompt..." : "Install app"}
              </button>
              <button
                type="button"
                onClick={dismissInstallCard}
                className="pill-btn min-h-11 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
              >
                Not now
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={dismissInstallCard}
              className="pill-btn min-h-11 rounded-xl border border-black/[0.06] bg-white px-4 py-3 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)]"
            >
              Hide tip
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
