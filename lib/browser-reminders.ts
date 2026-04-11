export const DAILY_REMINDER_TITLE = "ImproTrack reminder";
export const DAILY_REMINDER_BODY =
  "Don't forget to check in on your habits today.";
export const DAILY_REMINDER_URL = "/dashboard";

const STORAGE_PREFIX = "improtrack-daily-reminder";

export type ReminderPermissionState = NotificationPermission | "unsupported";

type ZonedDateParts = {
  year: string;
  month: string;
  day: string;
};

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getZonedDateTimeParts(date: Date, timeZone: string): ZonedDateParts {
  const safeTimeZone = timeZone || "UTC";
  let formatter: Intl.DateTimeFormat;

  try {
    formatter = getFormatter(safeTimeZone);
  } catch {
    formatter = getFormatter("UTC");
  }

  const values = new Map(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: values.get("year") ?? "0000",
    month: values.get("month") ?? "01",
    day: values.get("day") ?? "01",
  };
}

export function getReminderEnabledStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}:enabled`;
}

export function getReminderDeviceIdStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}:device-id`;
}

export function getReminderTokenStorageKey(userId: string) {
  return `${STORAGE_PREFIX}:${userId}:token`;
}

export function isNotificationApiSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermissionState(): ReminderPermissionState {
  if (!isNotificationApiSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export function getStoredReminderEnabled(userId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      localStorage.getItem(getReminderEnabledStorageKey(userId)) === "true"
    );
  } catch {
    return false;
  }
}

export function setStoredReminderEnabled(userId: string, enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getReminderEnabledStorageKey(userId), String(enabled));
  } catch {
    // Ignore localStorage failures in restricted browsing modes.
  }
}

export function getStoredReminderDeviceId(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(getReminderDeviceIdStorageKey(userId));
  } catch {
    return null;
  }
}

export function getOrCreateReminderDeviceId(userId: string) {
  const existing = getStoredReminderDeviceId(userId);

  if (existing) {
    return existing;
  }

  const nextId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    localStorage.setItem(getReminderDeviceIdStorageKey(userId), nextId);
  } catch {
    // Ignore localStorage failures and use the ephemeral ID in memory.
  }

  return nextId;
}

export function getStoredReminderToken(userId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(getReminderTokenStorageKey(userId));
  } catch {
    return null;
  }
}

export function setStoredReminderToken(userId: string, token: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(getReminderTokenStorageKey(userId), token);
  } catch {
    // Ignore localStorage failures.
  }
}

export function clearStoredReminderToken(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(getReminderTokenStorageKey(userId));
  } catch {
    // Ignore localStorage failures.
  }
}

export function getCurrentReminderTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getReminderDateKeyForTimeZone(
  timeZone: string,
  now = new Date(),
) {
  const parts = getZonedDateTimeParts(now, timeZone);

  return `${parts.year}-${parts.month}-${parts.day}`;
}
