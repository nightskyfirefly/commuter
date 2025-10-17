// =============================
// File: lib/vehicles.ts (shared default list)
import type { Vehicle } from "./types";
export const DEFAULT_VEHICLES: Vehicle[] = [
  { id: "rav4_2017_awd", name: "2017 Toyota RAV4 XLE (non-hybrid AWD)", type: "ice", baseMpg75: 25, massKg: 1650 },
  { id: "mav_hybrid_cons", name: "Ford Maverick Hybrid (hilly - conservative)", type: "hybrid", baseMpg75: 29, massKg: 1700 },
  { id: "mav_hybrid_mid", name: "Ford Maverick Hybrid (hilly - mid)", type: "hybrid", baseMpg75: 31, massKg: 1700 },
  { id: "mav_hybrid_flat", name: "Ford Maverick Hybrid (flat baseline)", type: "hybrid", baseMpg75: 33, massKg: 1700 },
  { id: "rav4_hybrid", name: "Toyota RAV4 Hybrid AWD", type: "hybrid", baseMpg75: 32, massKg: 1700 },
  { id: "f150_hybrid", name: "Ford F-150 Hybrid PowerBoost", type: "hybrid", baseMpg75: 20, massKg: 2450 },
];
