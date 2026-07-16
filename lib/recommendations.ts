import type {
  InventoryRow,
  MoveRecommendation,
} from "@/types/inventory";

type ProductGroup = {
  product: string;
  rows: InventoryRow[];
};

const EXCLUDED_CATEGORIES = new Set([
  "accessory",
  "accessories",
]);

function cleanValue(value: string): string {
  let cleaned = String(value ?? "").trim();

  if (
    cleaned.startsWith('="') &&
    cleaned.endsWith('"')
  ) {
    cleaned = cleaned.slice(2, -1);
  }

  return cleaned.trim();
}

function normalize(value: string): string {
  return cleanValue(value).toLowerCase();
}

function isExcludedCategory(category: string): boolean {
  return EXCLUDED_CATEGORIES.has(normalize(category));
}

function isVault(room: string): boolean {
  return normalize(room).includes("vault");
}

function isBackstock(room: string): boolean {
  const normalizedRoom = normalize(room);

  return (
    normalizedRoom.includes("backstock") ||
    normalizedRoom.includes("back stock")
  );
}

function isReceivingRoom(room: string): boolean {
  return normalize(room).includes("receiving");
}

export function createMoveRecommendations(
  rows: InventoryRow[]
): MoveRecommendation[] {
  const groupedProducts = new Map<
    string,
    ProductGroup
  >();

  for (const row of rows) {
    /*
     * Accessories remain visible in Inventory Explorer,
     * but they are not eligible for Vault replenishment.
     */
    if (isExcludedCategory(row.category)) {
      continue;
    }

    const productKey = normalize(row.product);

    if (!productKey) {
      continue;
    }

    const existingGroup = groupedProducts.get(
      productKey
    );

    if (existingGroup) {
      existingGroup.rows.push(row);
      continue;
    }

    groupedProducts.set(productKey, {
      product: cleanValue(row.product),
      rows: [row],
    });
  }

  const recommendations: MoveRecommendation[] = [];

  for (const group of groupedProducts.values()) {
    const vaultAvailable = group.rows
      .filter((row) => isVault(row.room))
      .reduce(
        (total, row) => total + row.available,
        0
      );

    /*
     * Do not recommend anything when this exact
     * product already has positive inventory in Vault.
     */
    if (vaultAvailable > 0) {
      continue;
    }

    const backstockPackages = group.rows.filter(
      (row) =>
        isBackstock(row.room) &&
        row.available > 0 &&
        cleanValue(row.packageId)
    );

    const receivingPackages = group.rows.filter(
      (row) =>
        isReceivingRoom(row.room) &&
        row.available > 0 &&
        cleanValue(row.packageId)
    );

    /*
     * Backstock is preferred.
     * Receiving Room is only used when no positive
     * Backstock package exists for the exact product.
     */
    const eligiblePackages =
      backstockPackages.length > 0
        ? backstockPackages
        : receivingPackages;

    if (eligiblePackages.length === 0) {
      continue;
    }

    /*
     * Select exactly one METRC package.
     * For now, choose the eligible package with the
     * highest available quantity.
     */
    const selectedPackage = [
      ...eligiblePackages,
    ].sort(
      (a, b) => b.available - a.available
    )[0];

    recommendations.push({
      packageId: cleanValue(
        selectedPackage.packageId
      ),
      product: cleanValue(
        selectedPackage.product
      ),
      strain: cleanValue(selectedPackage.strain),
      category: cleanValue(
        selectedPackage.category
      ),
      vendor: cleanValue(selectedPackage.vendor),
      available: selectedPackage.available,
      moveFrom: cleanValue(selectedPackage.room),
      moveTo: "Vault",
    });
  }

  return recommendations.sort((a, b) =>
    a.product.localeCompare(b.product)
  );
}