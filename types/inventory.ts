export type InventoryRow = {
  sku: string;
  product: string;
  packageId: string;
  category: string;
  strain: string;
  vendor: string;
  room: string;
  available: number;
};

export type MoveRecommendation = {
  packageId: string;
  product: string;
  strain: string;
  category: string;
  vendor: string;
  available: number;
  moveFrom: string;
  moveTo: "Vault";
};