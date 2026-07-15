import Papa from "papaparse";
import type { InventoryRow } from "@/types/inventory";

type RawInventoryRow = {
  SKU?: unknown;
  Product?: unknown;
  "Package ID"?: unknown;
  Category?: unknown;
  Strain?: unknown;
  Vendor?: unknown;
  Room?: unknown;
  Available?: unknown;
};

function cleanValue(value: unknown): string {
  let cleaned = String(value ?? "").trim();

  if (cleaned.startsWith('="') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

function parseAvailable(value: unknown): number {
  const parsed = Number(cleanValue(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseInventoryFile(
  file: File
): Promise<InventoryRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawInventoryRow>(file, {
      header: true,
      skipEmptyLines: true,

      complete: (results) => {
        if (results.errors.length > 0) {
          reject(
            new Error(
              results.errors.map((error) => error.message).join(", ")
            )
          );
          return;
        }

        const rows = results.data
          .map(
            (row): InventoryRow => ({
              sku: cleanValue(row.SKU),
              product: cleanValue(row.Product),
              packageId: cleanValue(row["Package ID"]),
              category: cleanValue(row.Category),
              strain: cleanValue(row.Strain),
              vendor: cleanValue(row.Vendor),
              room: cleanValue(row.Room),
              available: parseAvailable(row.Available),
            })
          )
          .filter((row) => row.product && row.packageId);

        resolve(rows);
      },

      error: (error) => {
        reject(error);
      },
    });
  });
}