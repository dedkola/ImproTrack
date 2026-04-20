"use client";

import { useEffect } from "react";
import {
  getFirebaseApp,
  getFirebaseMeasurementId,
  hasFirebaseClientConfig,
} from "@/lib/firebase/client";

export function FirebaseAnalytics() {
  useEffect(() => {
    let isMounted = true;

    async function enableAnalytics() {
      if (!hasFirebaseClientConfig() || !getFirebaseMeasurementId()) {
        return;
      }

      try {
        const { getAnalytics, isSupported } =
          await import("firebase/analytics");
        const supported = await isSupported();

        if (!supported || !isMounted) {
          return;
        }

        getAnalytics(getFirebaseApp());
      } catch {
        return;
      }
    }

    void enableAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
