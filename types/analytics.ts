import type { CountEntry } from "@/types/count";

export type CountSessionSummary = {
  scopeType: "all" | "room" | "category";
  scopeValue: string;
  totalRows: number;
  countedRows: number;
  matchedRows: number;
  mismatchedRows: number;
  notCountedRows: number;
  accuracy: number;
  progress: number;
  startedAt: string;
  updatedAt: string;
};

export type SavedCountSession = {
  summary: CountSessionSummary;
  entries: CountEntry[];
  countFileName: string;
};

export type RoomMetric = {
  room: string;
  packageCount: number;
  availableTotal: number;
};

export type VendorMetric = {
  vendor: string;
  packageCount: number;
  availableTotal: number;
};

export type InventoryAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  value?: number;
  href?: string;
};

export type InventoryMetadata = {
  fileName: string;
  totalRows: number;
  positivePackages: number;
  zeroQuantityPackages: number;
  uniqueProducts: number;
  duplicatePackageIds: number;
  lastUploadedAt: string;
};

export type ManagerAnalytics = {
  readinessScore: number;
  readinessLabel: string;

  pendingTransfers: number;
  missingVaultProducts: number;
  receivingDirectMoves: number;
  receivingPackages: number;
  completedTransfersToday: number;

  latestCount: CountSessionSummary | null;

  rooms: RoomMetric[];
  vendors: VendorMetric[];
  alerts: InventoryAlert[];
  metadata: InventoryMetadata;
};