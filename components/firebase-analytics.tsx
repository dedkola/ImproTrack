"use client";

import { useEffect } from "react";
import { firebaseConfig, getFirebaseApp } from "@/lib/firebase/client";

export function FirebaseAnalytics() {
  useEffect(() => {
    let isMounted = true;

    async function enableAnalytics() {
      if (!firebaseConfig.measurementId) {
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
