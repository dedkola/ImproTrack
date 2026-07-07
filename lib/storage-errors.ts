import type {
  BootstrapErrorSource,
  HabitStorageBootstrapError,
  HabitStorageFullHistoryState,
  HabitStorageMutationError,
  HabitStorageMutationKind,
  HabitStorageSyncIssue,
} from "@/lib/storage-types";

export function toErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "permission-denied"
  ) {
    return "Firestore rejected the request. Publish your Firestore rules, then sign out and sign back in once to refresh the session.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function createBootstrapError(
  source: BootstrapErrorSource,
  error: unknown,
  fallback: string,
): HabitStorageBootstrapError {
  return {
    source,
    message: toErrorMessage(error, fallback),
  };
}

export function createListenerIssue(
  source: BootstrapErrorSource,
  error: unknown,
  fallback: string,
): HabitStorageSyncIssue {
  return {
    kind: "listener",
    source,
    message: toErrorMessage(error, fallback),
  };
}

export function createMutationIssue(
  mutation: HabitStorageMutationKind,
  error: unknown,
  fallback: string,
): HabitStorageMutationError {
  return {
    kind: "mutation",
    mutation,
    message: toErrorMessage(error, fallback),
  };
}

export function getIdleFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "idle",
    hasFullHistory: false,
    error: null,
  };
}

export function getLoadingFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "loading",
    hasFullHistory: false,
    error: null,
  };
}

export function getReadyFullHistoryState(): HabitStorageFullHistoryState {
  return {
    status: "ready",
    hasFullHistory: true,
    error: null,
  };
}

export function getErroredFullHistoryState(
  error: unknown,
  fallback: string,
): HabitStorageFullHistoryState {
  return {
    status: "error",
    hasFullHistory: false,
    error: toErrorMessage(error, fallback),
  };
}
