import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function isVault(room: string): boolean {
  return normalize(room).includes("vault");
}

function isBackstock(room: string): boolean {
  return normalize(room).includes("backstock");
}

export function createMoveRecommendations(
  rows: InventoryRow[]
): MoveRecommendation[] {
  const groupedProducts = new Map<string, InventoryRow[]>();

  for (const row of rows) {
    const productKey = normalize(row.product);

    if (!productKey) continue;

    const existingRows = groupedProducts.get(productKey) ?? [];
    existingRows.push(row);
    groupedProducts.set(productKey, existingRows);
  }

  const recommendations: MoveRecommendation[] = [];

  for (const productRows of groupedProducts.values()) {
    const vaultAvailable = productRows
      .filter((row) => isVault(row.room))
      .reduce((total, row) => total + row.available, 0);

    // Leave all Backstock packages alone when Vault has inventory.
    if (vaultAvailable > 0) {
      continue;
    }

    const backstockPackages = productRows.filter(
      (row) =>
        isBackstock(row.room) &&
        row.available > 0 &&
        row.packageId
    );

    if (backstockPackages.length === 0) {
      continue;
    }

    // Choose exactly one METRC package.
    // For now, select the package with the highest available quantity.
    const selectedPackage = [...backstockPackages].sort(
      (a, b) => b.available - a.available
    )[0];

    recommendations.push({
      packageId: selectedPackage.packageId,
      product: selectedPackage.product,
      strain: selectedPackage.strain,
      category: selectedPackage.category,
      vendor: selectedPackage.vendor,
      available: selectedPackage.available,
      moveFrom: selectedPackage.room,
      moveTo: "Vault",
    });
  }

  return recommendations.sort((a, b) =>
    a.product.localeCompare(b.product)
  );
}