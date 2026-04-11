"use client";

import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearStoredReminderToken,
  DAILY_REMINDER_BODY,
  DAILY_REMINDER_TITLE,
  DAILY_REMINDER_URL,
  getCurrentReminderTimeZone,
  getNotificationPermissionState,
  getOrCreateReminderDeviceId,
  getStoredReminderDeviceId,
  getStoredReminderEnabled,
  getStoredReminderToken,
  isNotificationApiSupported,
  type ReminderPermissionState,
  setStoredReminderEnabled,
  setStoredReminderToken,
} from "@/lib/browser-reminders";
import {
  deleteFirebaseMessagingToken,
  getFirebaseMessagingToken,
  isFirebaseMessagingSupported,
} from "@/lib/firebase/messaging";
import { saveReminderDeviceRegistration } from "@/lib/firebase/reminder-store";

type DailyHabitReminderProviderProps = {
  userId: string;
  children: React.ReactNode;
};

type DailyHabitReminderContextValue = {
  isSupported: boolean;
  isPushConfigured: boolean;
  permission: ReminderPermissionState;
  isEnabled: boolean;
  setupError: string | null;
  enableReminder: () => Promise<void>;
  disableReminder: () => Promise<void>;
  sendPreview: () => Promise<boolean>;
};

const DailyHabitReminderContext = createContext<
  DailyHabitReminderContextValue | undefined
>(undefined);

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function DailyHabitReminderProvider({
  userId,
  children,
}: DailyHabitReminderProviderProps) {
  const [permission, setPermission] = useState<ReminderPermissionState>(() =>
    getNotificationPermissionState(),
  );
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const serviceWorkerRegistrationRef = useRef<ServiceWorkerRegistration | null>(
    null,
  );

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim() ?? "";
  const isPushConfigured = vapidKey.length > 0;

  const syncStoredState = useEffectEvent(() => {
    const nextPermission = getNotificationPermissionState();
    const nextEnabled =
      getStoredReminderEnabled(userId) && nextPermission === "granted";

    setPermission(nextPermission);
    setIsEnabled(nextEnabled);
  });

  const ensureServiceWorkerRegistration = useEffectEvent(async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error(
        "This browser cannot register a service worker for push reminders.",
      );
    }

    if (serviceWorkerRegistrationRef.current) {
      return serviceWorkerRegistrationRef.current;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    serviceWorkerRegistrationRef.current = registration;
    return registration;
  });

  const showNotification = useEffectEvent(async () => {
    if (getNotificationPermissionState() !== "granted") {
      return false;
    }

    const registration = await ensureServiceWorkerRegistration();
    await registration.showNotification(DAILY_REMINDER_TITLE, {
      body: DAILY_REMINDER_BODY,
      data: {
        url: DAILY_REMINDER_URL,
      },
      tag: "habit-reminder-preview",
    });

    return true;
  });

  const syncReminderRegistration = useEffectEvent(async () => {
    const nextPermission = getNotificationPermissionState();
    const storedEnabled = getStoredReminderEnabled(userId);

    setPermission(nextPermission);
    setIsEnabled(storedEnabled && nextPermission === "granted");

    if (!storedEnabled) {
      return;
    }

    if (!isPushConfigured) {
      throw new Error(
        "Push reminders are not configured yet. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY first.",
      );
    }

    if (nextPermission !== "granted") {
      const deviceId = getStoredReminderDeviceId(userId);

      setStoredReminderEnabled(userId, false);
      clearStoredReminderToken(userId);
      setIsEnabled(false);

      if (deviceId) {
        await saveReminderDeviceRegistration(userId, deviceId, {
          enabled: false,
          timeZone: getCurrentReminderTimeZone(),
          token: null,
          userAgent: navigator.userAgent ?? null,
        });
      }

      return;
    }

    const registration = await ensureServiceWorkerRegistration();
    const token = await getFirebaseMessagingToken({
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      throw new Error(
        "Firebase Cloud Messaging could not create a browser token for reminders.",
      );
    }

    const deviceId = getOrCreateReminderDeviceId(userId);
    const previousToken = getStoredReminderToken(userId);

    await saveReminderDeviceRegistration(userId, deviceId, {
      enabled: true,
      timeZone: getCurrentReminderTimeZone(),
      token,
      userAgent: navigator.userAgent ?? null,
    });

    if (previousToken !== token) {
      setStoredReminderToken(userId, token);
    }

    setSetupError(null);
    setIsEnabled(true);
  });

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      syncStoredState();

      const supported =
        isNotificationApiSupported() &&
        window.isSecureContext &&
        "serviceWorker" in navigator &&
        (await isFirebaseMessagingSupported());

      if (!isMounted) {
        return;
      }

      setIsSupported(supported);

      if (!supported) {
        setSetupError(
          "This browser does not support Firebase push notifications for ImproTrack reminders.",
        );
        return;
      }

      if (!isPushConfigured) {
        setSetupError(
          "Push reminders are not configured for this deployment yet.",
        );
        return;
      }

      try {
        await ensureServiceWorkerRegistration();

        if (
          getStoredReminderEnabled(userId) &&
          getNotificationPermissionState() === "granted"
        ) {
          await syncReminderRegistration();
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setSetupError(
          toErrorMessage(
            error,
            "ImproTrack could not prepare push reminders in this browser.",
          ),
        );
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    ensureServiceWorkerRegistration,
    isPushConfigured,
    syncReminderRegistration,
    syncStoredState,
    userId,
  ]);

  useEffect(() => {
    const handleStorage = () => {
      syncStoredState();
    };

    const handleRefresh = () => {
      if (document.hidden) {
        return;
      }

      syncStoredState();

      if (getStoredReminderEnabled(userId)) {
        void syncReminderRegistration().catch((error) => {
          setSetupError(
            toErrorMessage(
              error,
              "ImproTrack could not refresh the push reminder token.",
            ),
          );
        });
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleRefresh);
    document.addEventListener("visibilitychange", handleRefresh);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleRefresh);
      document.removeEventListener("visibilitychange", handleRefresh);
    };
  }, [syncReminderRegistration, syncStoredState, userId]);

  const enableReminder = useEffectEvent(async () => {
    if (!isSupported) {
      throw new Error("This browser cannot receive background push reminders.");
    }

    if (!isPushConfigured) {
      throw new Error(
        "Push reminders are not configured yet. Add NEXT_PUBLIC_FIREBASE_VAPID_KEY first.",
      );
    }

    const nextPermission =
      getNotificationPermissionState() === "granted"
        ? "granted"
        : await Notification.requestPermission();

    setPermission(nextPermission);

    if (nextPermission !== "granted") {
      setStoredReminderEnabled(userId, false);
      setIsEnabled(false);
      throw new Error("Notification permission was not granted.");
    }

    setStoredReminderEnabled(userId, true);

    try {
      await syncReminderRegistration();
      setSetupError(null);
    } catch (error) {
      setStoredReminderEnabled(userId, false);
      setIsEnabled(false);
      throw error;
    }
  });

  const disableReminder = useEffectEvent(async () => {
    const deviceId = getStoredReminderDeviceId(userId);

    setStoredReminderEnabled(userId, false);
    clearStoredReminderToken(userId);
    setIsEnabled(false);

    try {
      await deleteFirebaseMessagingToken();
    } catch {
      // Keep going so Firestore still stops the reminder for this browser.
    }

    if (deviceId) {
      await saveReminderDeviceRegistration(userId, deviceId, {
        enabled: false,
        timeZone: getCurrentReminderTimeZone(),
        token: null,
        userAgent: navigator.userAgent ?? null,
      });
    }
  });

  const sendPreview = useEffectEvent(async () => {
    try {
      return await showNotification();
    } catch {
      return false;
    }
  });

  const value = useMemo(
    () => ({
      isSupported,
      isPushConfigured,
      permission,
      isEnabled,
      setupError,
      enableReminder,
      disableReminder,
      sendPreview,
    }),
    [
      disableReminder,
      enableReminder,
      isEnabled,
      isPushConfigured,
      isSupported,
      permission,
      sendPreview,
      setupError,
    ],
  );

  return (
    <DailyHabitReminderContext.Provider value={value}>
      {children}
    </DailyHabitReminderContext.Provider>
  );
}

export function useDailyHabitReminder() {
  const context = useContext(DailyHabitReminderContext);

  if (!context) {
    throw new Error(
      "useDailyHabitReminder must be used within DailyHabitReminderProvider.",
    );
  }

  return context;
}
