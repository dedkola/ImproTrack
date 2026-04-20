"use client";

import {
  type FirebaseApp,
  type FirebaseOptions,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

const firebaseEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function requireEnv(name: string, value: string | undefined) {

  if (!value) {
    throw new Error(`Missing Firebase environment variable: ${name}`);
  }

  return value;
}

export function hasFirebaseClientConfig() {
  return Boolean(
    firebaseEnv.apiKey &&
      firebaseEnv.authDomain &&
      firebaseEnv.projectId &&
      firebaseEnv.storageBucket &&
      firebaseEnv.messagingSenderId &&
      firebaseEnv.appId,
  );
}

export function getFirebaseMeasurementId() {
  return firebaseEnv.measurementId;
}

export function getFirebaseConfig(): FirebaseOptions {
  return {
    apiKey: requireEnv("NEXT_PUBLIC_FIREBASE_API_KEY", firebaseEnv.apiKey),
    authDomain: requireEnv(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      firebaseEnv.authDomain,
    ),
    projectId: requireEnv(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      firebaseEnv.projectId,
    ),
    storageBucket: requireEnv(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      firebaseEnv.storageBucket,
    ),
    messagingSenderId: requireEnv(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      firebaseEnv.messagingSenderId,
    ),
    appId: requireEnv("NEXT_PUBLIC_FIREBASE_APP_ID", firebaseEnv.appId),
    measurementId: getFirebaseMeasurementId(),
  };
}

export function getFirebaseApp(): FirebaseApp {
  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());
}
