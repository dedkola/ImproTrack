"use client";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";

type ReminderDeviceRegistrationInput = {
  enabled: boolean;
  timeZone: string;
  token: string | null;
  userAgent: string | null;
};

function reminderDeviceDoc(userId: string, deviceId: string) {
  return doc(
    getFirebaseFirestore(),
    "users",
    userId,
    "notificationTokens",
    deviceId,
  );
}

export async function saveReminderDeviceRegistration(
  userId: string,
  deviceId: string,
  input: ReminderDeviceRegistrationInput,
) {
  await setDoc(
    reminderDeviceDoc(userId, deviceId),
    {
      enabled: input.enabled,
      platform: "web",
      timeZone: input.timeZone,
      token: input.token,
      userAgent: input.userAgent,
      lastSeenAt: serverTimestamp(),
      _updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
