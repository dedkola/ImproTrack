"use client";

import {
  type Auth,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirebaseApp } from "@/lib/firebase/client";

let firebaseAuth: Auth | undefined;
let googleAuthProvider: GoogleAuthProvider | undefined;

export function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp());
  }

  return firebaseAuth;
}

export function getGoogleAuthProvider(): GoogleAuthProvider {
  if (!googleAuthProvider) {
    googleAuthProvider = new GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({ prompt: "select_account" });
  }

  return googleAuthProvider;
}

export async function signInWithGoogle() {
  return signInWithPopup(getFirebaseAuth(), getGoogleAuthProvider());
}

export async function signOutFromFirebase() {
  return signOut(getFirebaseAuth());
}
