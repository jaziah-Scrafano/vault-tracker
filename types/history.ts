export type CompletedMove = {
  packageId: string;
  product: string;
  strain: string;
  vendor: string;
  category: string;
  available: number;
  moveFrom: string;
  moveTo: "Vault";
  completedAt: string;
};