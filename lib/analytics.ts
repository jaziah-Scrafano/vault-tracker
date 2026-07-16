import { createMoveRecommendations } from "@/lib/recommendations";

import type {
  CountSessionSummary,
  InventoryAlert,
  ManagerAnalytics,
  RoomMetric,
  VendorMetric,
} from "@/types/analytics";

import type { CompletedMove } from "@/types/history";
import type { InventoryRow } from "@/types/inventory";

type BuildManagerAnalyticsOptions = {
  inventory: InventoryRow[];
  completedMoves: CompletedMove[];
  latestCount: CountSessionSummary | null;
  fileName: string;
  lastUploadedAt: string;
};

export function buildManagerAnalytics({
  inventory,
  completedMoves,
  latestCount,
  fileName,
  lastUploadedAt,
}: BuildManagerAnalyticsOptions): ManagerAnalytics {
  const positiveInventory = inventory.filter(
    (row) => row.available > 0
  );

  const recommendations =
    createMoveRecommendations(inventory);

  const pendingTransfers = recommendations.length;

  const missingVaultProducts = new Set(
    recommendations.map((item) =>
      normalize(item.product)
    )
  ).size;

  const receivingDirectMoves = recommendations.filter(
    (item) =>
      normalize(item.moveFrom).includes("receiving")
  ).length;

  const receivingPackages = positiveInventory.filter(
    (row) =>
      normalize(row.room).includes("receiving")
  ).length;

  const completedTransfersToday =
    countCompletedToday(completedMoves);

  const rooms = buildRoomMetrics(positiveInventory);
  const vendors = buildVendorMetrics(positiveInventory);

  const duplicatePackageIds =
    countDuplicatePackageIds(inventory);

  const uniqueProducts = new Set(
    inventory
      .map((row) => normalize(row.product))
      .filter(Boolean)
  ).size;

  const zeroQuantityPackages = inventory.filter(
    (row) => row.available <= 0
  ).length;

  const metadata = {
    fileName,
    totalRows: inventory.length,
    positivePackages: positiveInventory.length,
    zeroQuantityPackages,
    uniqueProducts,
    duplicatePackageIds,
    lastUploadedAt,
  };

  const alerts = buildAlerts({
    pendingTransfers,
    missingVaultProducts,
    receivingDirectMoves,
    receivingPackages,
    duplicatePackageIds,
    latestCount,
  });

  const readinessScore = calculateReadinessScore({
    pendingTransfers,
    missingVaultProducts,
    receivingPackages,
    duplicatePackageIds,
    latestCount,
  });

  return {
    readinessScore,
    readinessLabel:
      getReadinessLabel(readinessScore),

    pendingTransfers,
    missingVaultProducts,
    receivingDirectMoves,
    receivingPackages,
    completedTransfersToday,

    latestCount,
    rooms,
    vendors,
    alerts,
    metadata,
  };
}

function buildRoomMetrics(
  inventory: InventoryRow[]
): RoomMetric[] {
  const roomMap = new Map<string, RoomMetric>();

  for (const row of inventory) {
    const room =
      cleanCsvValue(row.room) || "Not listed";

    const existing = roomMap.get(room) ?? {
      room,
      packageCount: 0,
      availableTotal: 0,
    };

    existing.packageCount += 1;
    existing.availableTotal += row.available;

    roomMap.set(room, existing);
  }

  return Array.from(roomMap.values()).sort(
    (a, b) => b.packageCount - a.packageCount
  );
}

function buildVendorMetrics(
  inventory: InventoryRow[]
): VendorMetric[] {
  const vendorMap = new Map<
    string,
    VendorMetric
  >();

  for (const row of inventory) {
    const vendor =
      cleanCsvValue(row.vendor) || "Not listed";

    const existing = vendorMap.get(vendor) ?? {
      vendor,
      packageCount: 0,
      availableTotal: 0,
    };

    existing.packageCount += 1;
    existing.availableTotal += row.available;

    vendorMap.set(vendor, existing);
  }

  return Array.from(vendorMap.values())
    .sort(
      (a, b) =>
        b.packageCount - a.packageCount
    )
    .slice(0, 8);
}

function buildAlerts({
  pendingTransfers,
  missingVaultProducts,
  receivingDirectMoves,
  receivingPackages,
  duplicatePackageIds,
  latestCount,
}: {
  pendingTransfers: number;
  missingVaultProducts: number;
  receivingDirectMoves: number;
  receivingPackages: number;
  duplicatePackageIds: number;
  latestCount: CountSessionSummary | null;
}): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];

  if (missingVaultProducts > 0) {
    alerts.push({
      id: "missing-vault",
      severity:
        missingVaultProducts >= 20
          ? "critical"
          : "warning",
      title: `${missingVaultProducts} products missing from Vault`,
      description:
        "These products have no positive Vault inventory but have an eligible package elsewhere.",
      value: missingVaultProducts,
      href: "/",
    });
  }

  if (pendingTransfers > 0) {
    alerts.push({
      id: "pending-transfers",
      severity:
        pendingTransfers >= 25
          ? "critical"
          : "warning",
      title: `${pendingTransfers} pending transfers`,
      description:
        "Packages are waiting to move into the Vault.",
      value: pendingTransfers,
      href: "/",
    });
  }

  if (receivingDirectMoves > 0) {
    alerts.push({
      id: "receiving-direct",
      severity: "warning",
      title: `${receivingDirectMoves} direct Receiving moves`,
      description:
        "These products should move directly from Receiving because no eligible Backstock package exists.",
      value: receivingDirectMoves,
      href: "/",
    });
  }

  if (receivingPackages >= 40) {
    alerts.push({
      id: "receiving-backlog",
      severity:
        receivingPackages >= 100
          ? "critical"
          : "warning",
      title: `${receivingPackages} packages in Receiving`,
      description:
        "Receiving contains a large number of positive package records.",
      value: receivingPackages,
      href: "/inventory",
    });
  }

  if (duplicatePackageIds > 0) {
    alerts.push({
      id: "duplicate-package-ids",
      severity: "critical",
      title: `${duplicatePackageIds} duplicate package IDs`,
      description:
        "The same METRC Package ID appears more than once in the uploaded inventory.",
      value: duplicatePackageIds,
      href: "/inventory",
    });
  }

  if (
    latestCount &&
    latestCount.mismatchedRows > 0
  ) {
    alerts.push({
      id: "count-discrepancies",
      severity:
        latestCount.mismatchedRows >= 5
          ? "critical"
          : "warning",
      title: `${latestCount.mismatchedRows} count discrepancies`,
      description:
        "The latest cycle count contains physical quantities that do not match the hard count.",
      value: latestCount.mismatchedRows,
      href: "/count",
    });
  }

  if (
    latestCount &&
    latestCount.progress < 100
  ) {
    alerts.push({
      id: "count-incomplete",
      severity: "info",
      title: `Latest count is ${latestCount.progress}% complete`,
      description:
        `${latestCount.notCountedRows} packages remain uncounted in the current cycle.`,
      value: latestCount.notCountedRows,
      href: "/count",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "all-clear",
      severity: "info",
      title: "No urgent inventory alerts",
      description:
        "Vault coverage, receiving, package IDs, and the latest count currently show no major issues.",
    });
  }

  return alerts;
}

function calculateReadinessScore({
  pendingTransfers,
  missingVaultProducts,
  receivingPackages,
  duplicatePackageIds,
  latestCount,
}: {
  pendingTransfers: number;
  missingVaultProducts: number;
  receivingPackages: number;
  duplicatePackageIds: number;
  latestCount: CountSessionSummary | null;
}): number {
  let score = 100;

  score -= Math.min(
    missingVaultProducts * 1.5,
    25
  );

  score -= Math.min(
    pendingTransfers * 0.5,
    15
  );

  score -= Math.min(
    receivingPackages * 0.1,
    10
  );

  score -= Math.min(
    duplicatePackageIds * 5,
    25
  );

  if (latestCount) {
    score -= Math.min(
      latestCount.mismatchedRows * 3,
      18
    );

    if (latestCount.progress < 100) {
      score -= Math.min(
        (100 - latestCount.progress) * 0.1,
        7
      );
    }

    if (latestCount.countedRows > 0) {
      score -= Math.min(
        (100 - latestCount.accuracy) * 0.2,
        10
      );
    }
  }

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function getReadinessLabel(
  score: number
): string {
  if (score >= 95) {
    return "Excellent";
  }

  if (score >= 85) {
    return "Ready";
  }

  if (score >= 70) {
    return "Needs attention";
  }

  if (score >= 50) {
    return "At risk";
  }

  return "Critical";
}

function countDuplicatePackageIds(
  inventory: InventoryRow[]
): number {
  const counts = new Map<string, number>();

  for (const row of inventory) {
    const packageId = normalize(row.packageId);

    if (!packageId) {
      continue;
    }

    counts.set(
      packageId,
      (counts.get(packageId) ?? 0) + 1
    );
  }

  let duplicates = 0;

  for (const count of counts.values()) {
    if (count > 1) {
      duplicates += 1;
    }
  }

  return duplicates;
}

function countCompletedToday(
  moves: CompletedMove[]
): number {
  const today = new Date().toDateString();

  return moves.filter((move) => {
    const completedAt = new Date(
      move.completedAt
    );

    return (
      !Number.isNaN(completedAt.getTime()) &&
      completedAt.toDateString() === today
    );
  }).length;
}

function cleanCsvValue(
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

function normalize(
  value: string | undefined
): string {
  return cleanCsvValue(value).toLowerCase();
}