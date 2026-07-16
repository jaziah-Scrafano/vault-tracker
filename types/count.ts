export type CountStatus =
  | "not-counted"
  | "match"
  | "mismatch";

export type CountScopeType =
  | "all"
  | "room"
  | "category";

export type CountScope = {
  type: CountScopeType;
  value: string;
};

export type CountEntry = {
  packageId: string;
  counted: number | null;
};

export type CountResult = {
  packageId: string;
  product: string;
  room: string;
  category: string;
  vendor: string;
  expected: number;
  counted: number | null;
  variance: number | null;
  status: CountStatus;
};