import type { InventoryRow } from "@/types/inventory";
import type {
  CountEntry,
  CountResult,
} from "@/types/count";

export function buildCountResults(
  inventory: InventoryRow[],
  entries: CountEntry[]
): CountResult[] {
  const countMap = new Map<string, number | null>();

  for (const entry of entries) {
    countMap.set(
      normalizePackageId(entry.packageId),
      entry.counted
    );
  }

  return inventory
    .filter((row) => cleanCsvValue(row.packageId))
    .map((row) => {
      const packageId = cleanCsvValue(row.packageId);
      const counted =
        countMap.get(normalizePackageId(packageId)) ?? null;

      const variance =
        counted === null
          ? null
          : counted - row.available;

      const status =
        counted === null
          ? "not-counted"
          : variance === 0
            ? "match"
            : "mismatch";

      return {
        packageId,
        product: cleanCsvValue(row.product),
        room: cleanCsvValue(row.room),
        category:
          cleanCsvValue(row.category) || "Uncategorized",
        vendor:
          cleanCsvValue(row.vendor) || "Vendor not listed",
        expected: row.available,
        counted,
        variance,
        status,
      };
    })
    .sort((a, b) => {
      const roomCompare = a.room.localeCompare(b.room);

      if (roomCompare !== 0) {
        return roomCompare;
      }

      return a.product.localeCompare(b.product);
    });
}

export function cleanCsvValue(
  value: string | undefined
): string {
  let cleaned = String(value ?? "").trim();

  if (
    cleaned.startsWith('="') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

export function normalizePackageId(
  value: string
): string {
  return cleanCsvValue(value).toLowerCase();
}