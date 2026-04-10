"use client";

import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
} from "firebase/messaging";
import { getFirebaseApp } from "@/lib/firebase/client";

let firebaseMessaging: Messaging | null | undefined;
let messagingSupportPromise: Promise<boolean> | null = null;

export async function isFirebaseMessagingSupported() {
  if (!messagingSupportPromise) {
    messagingSupportPromise = isSupported().catch(() => false);
  }

  return messagingSupportPromise;
}

export async function getFirebaseMessagingInstance() {
  const supported = await isFirebaseMessagingSupported();

  if (!supported) {
    return null;
  }

  if (firebaseMessaging === undefined) {
    firebaseMessaging = getMessaging(getFirebaseApp());
  }

  return firebaseMessaging;
}

export async function getFirebaseMessagingToken(options: {
  vapidKey: string;
  serviceWorkerRegistration: ServiceWorkerRegistration;
}) {
  const messaging = await getFirebaseMessagingInstance();

  if (!messaging) {
    return null;
  }

  return getToken(messaging, options);
}

export async function deleteFirebaseMessagingToken() {
  const messaging = await getFirebaseMessagingInstance();

  if (!messaging) {
    return false;
  }

  return deleteToken(messaging);
}
