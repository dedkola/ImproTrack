"use client";

import {
  type FirebaseStorage,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseApp } from "@/lib/firebase/client";

let firebaseStorage: FirebaseStorage | undefined;

export function getFirebaseStorage(): FirebaseStorage {
  if (!firebaseStorage) {
    firebaseStorage = getStorage(getFirebaseApp());
  }

  return firebaseStorage;
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const storage = getFirebaseStorage();
  const avatarRef = ref(storage, `users/${userId}/profile/avatar`);
  await uploadBytes(avatarRef, file, { contentType: file.type });
  return getDownloadURL(avatarRef);
}

export async function deleteUserAvatar(userId: string): Promise<void> {
  const storage = getFirebaseStorage();
  const avatarRef = ref(storage, `users/${userId}/profile/avatar`);
  try {
    await deleteObject(avatarRef);
  } catch {
    // Ignore if file doesn't exist
  }
}
