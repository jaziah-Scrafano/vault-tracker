import type {
  CountSessionSummary,
  SavedCountSession,
} from "@/types/analytics";
import type { CompletedMove } from "@/types/history";
import type { InventoryRow } from "@/types/inventory";

const COMPLETED_MOVES_KEY =
  "vault-tracker-completed-moves";

const CURRENT_INVENTORY_KEY =
  "vault-tracker-current-inventory";

const INVENTORY_FILE_NAME_KEY =
  "vault-tracker-inventory-file-name";

const LATEST_COUNT_SESSION_KEY =
  "vault-tracker-latest-count-session";

const SAVED_COUNT_SESSION_KEY =
  "vault-tracker-saved-count-session";

const INVENTORY_UPLOAD_TIME_KEY =
  "vault-tracker-inventory-upload-time";

/* -------------------------------------------------------------------------- */
/* Completed transfer history                                                  */
/* -------------------------------------------------------------------------- */

export function getCompletedMoves(): CompletedMove[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(
      COMPLETED_MOVES_KEY
    );

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed)
      ? (parsed as CompletedMove[])
      : [];
  } catch {
    return [];
  }
}

export function saveCompletedMoves(
  moves: CompletedMove[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      COMPLETED_MOVES_KEY,
      JSON.stringify(moves)
    );
  } catch {
    // Ignore browser storage failures.
  }
}

export function clearCompletedMoves(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    COMPLETED_MOVES_KEY
  );
}

/* -------------------------------------------------------------------------- */
/* Current uploaded inventory                                                  */
/* -------------------------------------------------------------------------- */

export function getCurrentInventory(): InventoryRow[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = window.localStorage.getItem(
      CURRENT_INVENTORY_KEY
    );

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed)
      ? (parsed as InventoryRow[])
      : [];
  } catch {
    return [];
  }
}

export function saveCurrentInventory(
  inventory: InventoryRow[]
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CURRENT_INVENTORY_KEY,
      JSON.stringify(inventory)
    );
  } catch {
    // Ignore browser storage failures.
  }
}

export function clearCurrentInventory(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    CURRENT_INVENTORY_KEY
  );

  window.localStorage.removeItem(
    INVENTORY_FILE_NAME_KEY
  );

  window.localStorage.removeItem(
    INVENTORY_UPLOAD_TIME_KEY
  );
}

/* -------------------------------------------------------------------------- */
/* Uploaded inventory filename                                                 */
/* -------------------------------------------------------------------------- */

export function getInventoryFileName(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(
      INVENTORY_FILE_NAME_KEY
    ) ?? ""
  );
}

export function saveInventoryFileName(
  fileName: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    INVENTORY_FILE_NAME_KEY,
    fileName
  );
}

/* -------------------------------------------------------------------------- */
/* Inventory upload time                                                       */
/* -------------------------------------------------------------------------- */

export function getInventoryUploadTime(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem(
      INVENTORY_UPLOAD_TIME_KEY
    ) ?? ""
  );
}

export function saveInventoryUploadTime(
  uploadedAt: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    INVENTORY_UPLOAD_TIME_KEY,
    uploadedAt
  );
}

/* -------------------------------------------------------------------------- */
/* Latest count-session summary                                                */
/* -------------------------------------------------------------------------- */

export function getLatestCountSession():
  | CountSessionSummary
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(
      LATEST_COUNT_SESSION_KEY
    );

    if (!saved) {
      return null;
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return null;
    }

    return parsed as CountSessionSummary;
  } catch {
    return null;
  }
}

export function saveLatestCountSession(
  session: CountSessionSummary
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      LATEST_COUNT_SESSION_KEY,
      JSON.stringify(session)
    );
  } catch {
    // Ignore browser storage failures.
  }
}

export function clearLatestCountSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    LATEST_COUNT_SESSION_KEY
  );
}

/* -------------------------------------------------------------------------- */
/* Full active count session                                                   */
/* -------------------------------------------------------------------------- */

export function getSavedCountSession():
  | SavedCountSession
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const saved = window.localStorage.getItem(
      SAVED_COUNT_SESSION_KEY
    );

    if (!saved) {
      return null;
    }

    const parsed: unknown = JSON.parse(saved);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return null;
    }

    return parsed as SavedCountSession;
  } catch {
    return null;
  }
}

export function saveCountSession(
  session: SavedCountSession
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      SAVED_COUNT_SESSION_KEY,
      JSON.stringify(session)
    );
  } catch {
    // Ignore browser storage failures.
  }
}

export function clearSavedCountSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(
    SAVED_COUNT_SESSION_KEY
  );
}