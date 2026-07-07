import type { HabitDefinition } from "@/lib/habits";

export type SlotRecords = Record<string, boolean>;
export type DayRecords = Record<string, SlotRecords>;
export type HabitRecords = Record<string, DayRecords>;
export type PendingRecordPatches = Record<string, SlotRecords>;

export type HabitMutationInput = Omit<
  HabitDefinition,
  "id" | "slug" | "createdAt" | "archived"
>;

export type BootstrapErrorSource = "habits" | "records";

export type HabitStorageBootstrapError = {
  source: BootstrapErrorSource;
  message: string;
};

export type HabitStorageMutationKind =
  | "add-habit"
  | "update-habit"
  | "delete-habit"
  | "archive-habit"
  | "restore-habit"
  | "reorder-habits"
  | "toggle-record";

export type HabitStorageMutationError = {
  kind: "mutation";
  mutation: HabitStorageMutationKind;
  message: string;
};

export type HabitStorageSyncIssue =
  | HabitStorageMutationError
  | {
      kind: "listener";
      source: BootstrapErrorSource;
      message: string;
    };

export type HabitStorageSyncState = {
  isSyncing: boolean;
  pendingMutationCount: number;
  pendingRecordCount: number;
  latestIssue: HabitStorageSyncIssue | null;
  latestMutationError: HabitStorageMutationError | null;
  isRecordPending: (habitId: string, dateKey: string) => boolean;
};

export type HabitStorageFullHistoryState =
  | {
      status: "idle";
      hasFullHistory: false;
      error: null;
    }
  | {
      status: "loading";
      hasFullHistory: false;
      error: null;
    }
  | {
      status: "ready";
      hasFullHistory: true;
      error: null;
    }
  | {
      status: "error";
      hasFullHistory: false;
      error: string;
    };
