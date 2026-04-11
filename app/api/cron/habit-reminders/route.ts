import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  DAILY_REMINDER_BODY,
  DAILY_REMINDER_TITLE,
  DAILY_REMINDER_URL,
  getReminderDateKeyForTimeZone,
} from "@/lib/browser-reminders";
import {
  getFirebaseAdminFirestore,
  getFirebaseAdminMessaging,
} from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReminderDeviceDocument = {
  enabled?: boolean;
  lastSentDate?: string | null;
  timeZone?: string;
  token?: string | null;
};

type ServerHabitDefinition = {
  archived?: boolean;
  id?: string;
  timeSlots?: string[];
};

type RecordsDocument = {
  entries?: Record<string, Record<string, boolean>>;
};

type DueReminderDevice = {
  dateKey: string;
  docRef: FirebaseFirestore.DocumentReference;
  token: string;
  userId: string;
};

const INVALID_TOKEN_CODES = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function isSlotCompleted(
  slots: Record<string, boolean> | undefined,
  slotName: string,
  fallbackToAny: boolean,
) {
  if (!slots) {
    return false;
  }

  if (typeof slots[slotName] === "boolean") {
    return slots[slotName];
  }

  const normalizedSlotName = slotName.trim().toLowerCase();
  const normalizedEntry = Object.entries(slots).find(
    ([key]) => key.trim().toLowerCase() === normalizedSlotName,
  );

  if (normalizedEntry) {
    return Boolean(normalizedEntry[1]);
  }

  return fallbackToAny ? Object.values(slots).some(Boolean) : false;
}

function isDayComplete(
  slots: Record<string, boolean> | undefined,
  timeSlots: string[] = ["default"],
) {
  const normalizedTimeSlots = timeSlots.length > 0 ? timeSlots : ["default"];

  if (normalizedTimeSlots.length <= 1) {
    return isSlotCompleted(slots, normalizedTimeSlots[0] ?? "default", true);
  }

  return normalizedTimeSlots.every((slotName) =>
    isSlotCompleted(slots, slotName, false),
  );
}

async function hasIncompleteHabitsForDate(userId: string, dateKey: string) {
  const firestore = getFirebaseAdminFirestore();
  const habitsRef = firestore
    .collection("users")
    .doc(userId)
    .collection("habits");
  const recordRef = firestore.doc(`users/${userId}/records/${dateKey}`);

  const [habitsSnapshot, recordSnapshot] = await Promise.all([
    habitsRef.get(),
    recordRef.get(),
  ]);

  const activeHabits = habitsSnapshot.docs
    .map((doc) => ({
      ...(doc.data() as ServerHabitDefinition),
      id: (doc.data() as ServerHabitDefinition).id ?? doc.id,
    }))
    .filter((habit) => !habit.archived);

  if (activeHabits.length === 0) {
    return false;
  }

  const entries =
    (recordSnapshot.data() as RecordsDocument | undefined)?.entries ?? {};

  return activeHabits.some((habit) => {
    const daySlots = entries[habit.id ?? ""];
    return !isDayComplete(daySlots, habit.timeSlots);
  });
}

function buildDueReminderDevices(
  now: Date,
  snapshot: FirebaseFirestore.QuerySnapshot,
) {
  return snapshot.docs.reduce<DueReminderDevice[]>((devices, entry) => {
    const data = entry.data() as ReminderDeviceDocument;
    const userId = entry.ref.parent.parent?.id;

    if (!userId || !data.enabled || !data.token) {
      return devices;
    }

    const timeZone = data.timeZone ?? "UTC";
    const dateKey = getReminderDateKeyForTimeZone(timeZone, now);

    if (data.lastSentDate === dateKey) {
      return devices;
    }

    devices.push({
      dateKey,
      docRef: entry.ref,
      token: data.token,
      userId,
    });

    return devices;
  }, []);
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const firestore = getFirebaseAdminFirestore();
  const messaging = getFirebaseAdminMessaging();
  const reminderDevicesSnapshot = await firestore
    .collectionGroup("notificationTokens")
    .where("enabled", "==", true)
    .get();

  const dueDevices = buildDueReminderDevices(now, reminderDevicesSnapshot);
  const eligibilityCache = new Map<string, Promise<boolean>>();

  const candidateDevices = (
    await Promise.all(
      dueDevices.map(async (device) => {
        const cacheKey = `${device.userId}:${device.dateKey}`;

        if (!eligibilityCache.has(cacheKey)) {
          eligibilityCache.set(
            cacheKey,
            hasIncompleteHabitsForDate(device.userId, device.dateKey),
          );
        }

        const hasIncompleteHabits = await eligibilityCache.get(cacheKey)!;
        return hasIncompleteHabits ? device : null;
      }),
    )
  ).filter((device): device is DueReminderDevice => device !== null);

  let sentCount = 0;
  let failureCount = 0;
  let invalidatedCount = 0;

  for (const deviceChunk of chunkArray(candidateDevices, 500)) {
    const response = await messaging.sendEach(
      deviceChunk.map((device) => ({
        token: device.token,
        data: {
          body: DAILY_REMINDER_BODY,
          tag: `habit-reminder-${device.dateKey}`,
          title: DAILY_REMINDER_TITLE,
          url: DAILY_REMINDER_URL,
        },
        webpush: {
          headers: {
            TTL: "3600",
            Urgency: "high",
          },
        },
      })),
    );

    const batch = firestore.batch();

    response.responses.forEach((result, index) => {
      const device = deviceChunk[index];

      if (result.success) {
        sentCount += 1;
        batch.set(
          device.docRef,
          {
            lastSentAt: FieldValue.serverTimestamp(),
            lastSentDate: device.dateKey,
            _updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return;
      }

      failureCount += 1;
      const errorCode = result.error?.code ?? "unknown";

      if (INVALID_TOKEN_CODES.has(errorCode)) {
        invalidatedCount += 1;
        batch.set(
          device.docRef,
          {
            enabled: false,
            invalidatedAt: FieldValue.serverTimestamp(),
            lastErrorCode: errorCode,
            token: null,
            _updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        return;
      }

      batch.set(
        device.docRef,
        {
          lastErrorAt: FieldValue.serverTimestamp(),
          lastErrorCode: errorCode,
          _updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    await batch.commit();
  }

  return NextResponse.json({
    candidateDevices: candidateDevices.length,
    dueDevices: dueDevices.length,
    failureCount,
    invalidatedCount,
    scannedDevices: reminderDevicesSnapshot.size,
    sentCount,
    timestamp: now.toISOString(),
  });
}
