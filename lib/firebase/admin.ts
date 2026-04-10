import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function requireServerEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
}

function readServiceAccountConfig(): ServiceAccountConfig {
  const fromJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (fromJson) {
    const parsed = JSON.parse(fromJson) as Partial<ServiceAccountConfig>;

    return {
      projectId: requireServerEnv(
        "FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON.projectId",
        parsed.projectId,
      ),
      clientEmail: requireServerEnv(
        "FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON.clientEmail",
        parsed.clientEmail,
      ),
      privateKey: requireServerEnv(
        "FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON.privateKey",
        parsed.privateKey,
      ).replace(/\\n/g, "\n"),
    };
  }

  return {
    projectId: requireServerEnv(
      "FIREBASE_ADMIN_PROJECT_ID",
      process.env.FIREBASE_ADMIN_PROJECT_ID ??
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    clientEmail: requireServerEnv(
      "FIREBASE_ADMIN_CLIENT_EMAIL",
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    ),
    privateKey: requireServerEnv(
      "FIREBASE_ADMIN_PRIVATE_KEY",
      process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    ).replace(/\\n/g, "\n"),
  };
}

export function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = readServiceAccountConfig();

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId,
  });
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

export function getFirebaseAdminMessaging() {
  return getMessaging(getFirebaseAdminApp());
}
