// =============================
// File: lib/types.ts
export type VehicleKind = "ice" | "hybrid";
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleKind;
  baseMpg75: number; // baseline mpg at ~75 mph
  massKg: number;
}
export interface SpeedShares {
  s65: number; // share 0..1
  s70: number;
  s75: number;
}
export interface ComputeInput {
  home: string;
  work: string;
  gasPrice: number;
  daysPerWeek: number;
  weeksPerYear: number;
  winterFrac: number; // 0..1
  winterPen: number;  // 0..1 (percent mpg loss)
  speedShares: SpeedShares;
  currentVehicleId: string;
  newVehicleId: string;
  upgradeCost: number;
  vehicles?: Vehicle[]; // optional override list
}
export interface ComputeResult {
  distanceMi: number;
  elevation: number[]; // meters (one-way densified samples)
  rtCostCur: number;
  rtCostNew: number;
  weeklyCur: number;
  weeklyNew: number;
  yearlyCur: number;
  yearlyNew: number;
  savings: number;
  roi: number | null;
  paybackYears: number | null;
}
