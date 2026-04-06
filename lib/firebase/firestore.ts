"use client";

import { type Firestore, getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase/client";

let firebaseFirestore: Firestore | undefined;

export function getFirebaseFirestore(): Firestore {
  if (!firebaseFirestore) {
    firebaseFirestore = getFirestore(getFirebaseApp());
  }

  return firebaseFirestore;
}
