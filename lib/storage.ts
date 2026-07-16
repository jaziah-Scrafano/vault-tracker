import type { CompletedMove } from "@/types/history";
import type { InventoryRow } from "@/types/inventory";

const COMPLETED_MOVES_KEY =
  "vault-tracker-completed-moves";

const CURRENT_INVENTORY_KEY =
  "vault-tracker-current-inventory";

const INVENTORY_FILE_NAME_KEY =
  "vault-tracker-inventory-file-name";

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

  window.localStorage.setItem(
    COMPLETED_MOVES_KEY,
    JSON.stringify(moves)
  );
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

  window.localStorage.setItem(
    CURRENT_INVENTORY_KEY,
    JSON.stringify(inventory)
  );
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
}

/* -------------------------------------------------------------------------- */
/* Uploaded file name                                                          */
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