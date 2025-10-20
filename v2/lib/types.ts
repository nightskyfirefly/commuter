// =============================
// File: lib/types.ts
export type VehicleKind = "ice" | "hybrid";

// Extended vehicle interface for API-sourced vehicles
export interface Vehicle {
  id: string;
  name: string;
  type: VehicleKind;
  baseMpg75: number; // baseline mpg at ~75 mph
  massKg: number;
  // Optional fields from API sources
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  cityMpg?: number;
  highwayMpg?: number;
  combinedMpg?: number;
  source?: 'manual' | 'epa' | 'carquery';
}

// API response types for vehicle lookup
export interface VehicleMake {
  Make_ID: number;
  Make_Name: string;
}

export interface VehicleModel {
  Model_ID: number;
  Model_Name: string;
}

export interface EPAVehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trany: string; // transmission
  drive: string; // 2WD, 4WD, AWD
  cylinders: number;
  displ: number; // engine displacement
  city08: number; // city MPG
  highway08: number; // highway MPG
  comb08: number; // combined MPG
  fuelType: string;
  VClass: string; // vehicle class
  atvType?: string; // alternative fuel type if applicable
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

// New interfaces for enhanced vehicle lookup
export interface VINDecodeResult {
  ModelYear?: string;
  Make?: string;
  Model?: string;
  FuelTypePrimary?: string;
  DriveType?: string;
  VIN?: string;
}

export interface VehicleCandidate {
  id: string;
  text: string;
  score: number;
}

export interface VehicleLookupResponse {
  sourceIds: {
    epaVehicleId?: string;
    vin?: string;
  };
  epa: {
    city: number;
    hwy: number;
    comb: number;
    drive: string;
    trany: string;
  };
  vehicle: {
    id: string;
    name: string;
    type: VehicleKind;
    baseMpg75: number;
    massKg: number | null;
  };
  candidates: VehicleCandidate[];
}