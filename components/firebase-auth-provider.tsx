"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onIdTokenChanged, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/auth";
import { hasFirebaseClientConfig } from "@/lib/firebase/client";

export type FirebaseAuthUser = Pick<
  User,
  "uid" | "displayName" | "email" | "photoURL" | "providerData"
>;

export type FirebaseAuthContextValue = {
  isLoading: boolean;
  user: FirebaseAuthUser | null;
};

const FirebaseAuthContext = createContext<FirebaseAuthContextValue | undefined>(
  undefined,
);

export function FirebaseAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseClientConfig()) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const unsubscribe = onIdTokenChanged(
      getFirebaseAuth(),
      async (nextUser) => {
        try {
          if (nextUser) {
            await nextUser.getIdToken();
          }

          if (!isMounted) {
            return;
          }

          setUser(nextUser);
        } catch {
          if (!isMounted) {
            return;
          }

          setUser(null);
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <FirebaseAuthContext.Provider value={{ isLoading, user }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function FirebaseAuthOverrideProvider({
  children,
  value,
}: Readonly<{
  children: React.ReactNode;
  value: FirebaseAuthContextValue;
}>) {
  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(FirebaseAuthContext);

  if (!context) {
    throw new Error(
      "useFirebaseAuth must be used within FirebaseAuthProvider.",
    );
  }

  return context;
}
