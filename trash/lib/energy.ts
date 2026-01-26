// =============================
// File: lib/energy.ts (shared)
import { J_PER_GAL_GAS } from "./config";
import type { Vehicle, VehicleKind, SpeedShares } from "./types";
import { haversine } from "./math";

function engineEff(kind: VehicleKind) { return kind === "hybrid" ? 0.33 : 0.27; }
function regenEff(kind: VehicleKind) { return kind === "hybrid" ? 0.15 : 0.0; }

export function mpgAtSpeedMix(baseMpg75: number, s: SpeedShares) {
  // simple factors: 65:+15%, 70:+8%, 75:+0%
  return baseMpg75 * (s.s65 * 1.15 + s.s70 * 1.08 + s.s75 * 1.0);
}

export function computeOneWayFuelGallons(
  path: [number, number][],
  elev: number[],
  vehicle: Vehicle,
  gasPrice: number,
  s: SpeedShares,
) {
  const mpgBaseAdj = mpgAtSpeedMix(vehicle.baseMpg75, s);
  let distanceMiles = 0;
  let climbJ = 0;
  let dropJ = 0;

  for (let i = 1; i < path.length; i++) {
    const d = haversine(path[i - 1], path[i]);
    distanceMiles += d / 1609.344;
    const dh = (elev[i] ?? elev[i - 1]) - elev[i - 1];
    if (dh > 0) climbJ += vehicle.massKg * 9.80665 * dh; else dropJ += vehicle.massKg * 9.80665 * Math.abs(dh);
  }

  const baseGallons = distanceMiles / mpgBaseAdj; // flat-road gallons
  const eff = engineEff(vehicle.type);
  const regen = regenEff(vehicle.type);
  const climbGallons = (climbJ / J_PER_GAL_GAS) / eff;
  const regenGallons = (dropJ / J_PER_GAL_GAS) * regen * eff; // simplified recovery
  const totalGallons = baseGallons + Math.max(0, climbGallons - regenGallons);
  const cost = totalGallons * gasPrice;

  return { distanceMiles, totalGallons, cost, baseGallons, climbGallons, regenGallons };
}
