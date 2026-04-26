"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "@/components/i18n-provider";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type InstallMode = "browser" | "ios";

type PwaInstallContextValue = {
  hasMounted: boolean;
  installMode: InstallMode | null;
  isInstallAvailable: boolean;
  isInstallCardVisible: boolean;
  isInstalling: boolean;
  dismissInstallCard: () => void;
  requestInstall: () => Promise<void>;
  showInstallCard: () => void;
};

type PwaControllerProps = {
  children?: React.ReactNode;
};

const INSTALL_DISMISS_KEY = "improtrack-install-dismissed";

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

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

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error("usePwaInstall must be used within PwaController");
  }

  return context;
}

export function PwaController({ children }: PwaControllerProps) {
  const { t } = useTranslation();
  const [hasMounted, setHasMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
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

      if (isStandaloneDisplayMode()) {
        return;
      }

      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      window.localStorage.removeItem(INSTALL_DISMISS_KEY);
      setInstallPromptEvent(null);
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

  const installMode = useMemo<InstallMode | null>(() => {
    if (!hasMounted || isInstalled) {
      return null;
    }

    if (installPromptEvent) {
      return "browser";
    }

    if (isIosSafariInstallable()) {
      return "ios";
    }

    return null;
  }, [hasMounted, installPromptEvent, isInstalled]);

  const isInstallAvailable = installMode !== null;
  const isInstallCardVisible = isInstallAvailable && !isInstalled && !isDismissed;

  const dismissInstallCard = useCallback(() => {
    window.localStorage.setItem(INSTALL_DISMISS_KEY, "1");
    setIsDismissed(true);
  }, []);

  const showInstallCard = useCallback(() => {
    window.localStorage.removeItem(INSTALL_DISMISS_KEY);
    setIsDismissed(false);
  }, []);

  const requestInstall = useCallback(async () => {
    if (installMode === "ios") {
      showInstallCard();
      return;
    }

    if (!installPromptEvent) {
      return;
    }

    setIsInstalling(true);

    try {
      await installPromptEvent.prompt();
      await installPromptEvent.userChoice;
    } catch {
      return;
    } finally {
      setInstallPromptEvent(null);
      setIsInstalling(false);
    }
  }, [installMode, installPromptEvent, showInstallCard]);

  const contextValue = useMemo<PwaInstallContextValue>(
    () => ({
      hasMounted,
      installMode,
      isInstallAvailable,
      isInstallCardVisible,
      isInstalling,
      dismissInstallCard,
      requestInstall,
      showInstallCard,
    }),
    [
      dismissInstallCard,
      hasMounted,
      installMode,
      isInstallAvailable,
      isInstallCardVisible,
      isInstalling,
      requestInstall,
      showInstallCard,
    ],
  );

  return (
    <PwaInstallContext.Provider value={contextValue}>
      {children}

      {hasMounted && !isOnline ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm sm:left-auto sm:right-6">
          <div
            aria-live="polite"
            className="pointer-events-auto rounded-[24px] border border-black/[0.08] bg-white/95 px-4 py-4 shadow-[var(--shadow-panel)] backdrop-blur-xl"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-600">
              {t("pwa_offline_mode")}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-ink-950">
              {t("pwa_offline_desc")}
            </p>
          </div>
        </div>
      ) : null}

      {hasMounted && isOnline && isInstallCardVisible ? (
        <div className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm sm:left-auto sm:right-6">
          <aside
            aria-label={t("pwa_install_heading")}
            className="pointer-events-auto rounded-2xl border border-black/[0.08] bg-white/95 px-3 py-3 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:rounded-[24px] sm:px-4 sm:py-4"
          >
            <div className="flex items-center justify-between gap-3 sm:items-start sm:gap-4">
              <div className="min-w-0">
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-600 sm:text-[11px]">
                  {t("pwa_install_title")}
                </p>
                <h2 className="mt-2 hidden font-display text-[22px] font-semibold tracking-tight text-ink-950 sm:block">
                  {t("pwa_install_heading")}
                </h2>
                <p className="mt-2 hidden text-[14px] leading-6 text-ink-700 sm:block">
                  {installMode === "browser"
                    ? t("pwa_install_browser_desc")
                    : t("pwa_install_ios_desc")}
                </p>
              </div>

              <button
                type="button"
                onClick={dismissInstallCard}
                aria-label={t("pwa_dismiss_install")}
                className="tap-target-compact inline-flex flex-shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[18px] leading-none text-ink-500 shadow-[var(--shadow-card)] transition-colors hover:text-ink-950"
              >
                ×
              </button>
            </div>

            <div className="mt-3 flex gap-2 sm:mt-4 sm:flex-row">
              {installMode === "browser" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void requestInstall()}
                    disabled={isInstalling}
                    className="pill-btn min-h-10 flex-1 rounded-xl bg-linear-to-r from-[#6D28D9] to-[#C026D3] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(109,40,217,0.28)] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-11 sm:py-3"
                  >
                    {isInstalling ? t("pwa_opening_prompt") : t("install_app")}
                  </button>
                  <button
                    type="button"
                    onClick={dismissInstallCard}
                    className="pill-btn min-h-10 flex-1 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:min-h-11 sm:py-3"
                  >
                    {t("pwa_not_now")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={dismissInstallCard}
                  className="pill-btn min-h-10 flex-1 rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-[14px] font-semibold text-ink-950 shadow-[var(--shadow-card)] sm:min-h-11 sm:py-3"
                >
                  {t("pwa_hide_tip")}
                </button>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </PwaInstallContext.Provider>
  );
}
