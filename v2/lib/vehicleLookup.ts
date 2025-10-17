// =============================
// File: lib/vehicleLookup.ts
// Utility functions for vehicle API lookups and MPG conversion
"use server";

import type { Vehicle, VehicleKind, EPAVehicle } from "./types";

/**
 * Convert EPA highway MPG to our baseline 75mph MPG
 * EPA highway test averages ~48mph, real-world 75mph is typically 10-20% lower
 * We use a conservative 15% reduction
 */
export function convertEPAtoBase75(highwayMpg: number): number {
  return Math.round(highwayMpg * 0.85 * 10) / 10; // 15% reduction, round to 1 decimal
}

/**
 * Determine vehicle type based on fuel type and model name
 */
export function determineVehicleType(
  fuelType: string,
  model: string
): VehicleKind {
  const modelLower = model.toLowerCase();
  const fuelLower = fuelType.toLowerCase();

  // Check for hybrid indicators
  if (
    fuelLower.includes("hybrid") ||
    fuelLower.includes("electric") ||
    modelLower.includes("hybrid") ||
    modelLower.includes("prime") ||
    modelLower.includes("plug-in")
  ) {
    return "hybrid";
  }

  return "ice";
}

/**
 * Estimate vehicle mass based on vehicle class if not available
 * These are rough estimates in kg
 */
export function estimateMassByClass(vehicleClass: string): number {
  const classLower = vehicleClass.toLowerCase();

  if (classLower.includes("compact") || classLower.includes("subcompact")) {
    return 1300; // ~2866 lbs
  }
  if (classLower.includes("midsize")) {
    return 1600; // ~3527 lbs
  }
  if (
    classLower.includes("large") ||
    classLower.includes("full") ||
    classLower.includes("sedan")
  ) {
    return 1800; // ~3968 lbs
  }
  if (
    classLower.includes("suv") ||
    classLower.includes("crossover") ||
    classLower.includes("sport utility")
  ) {
    return 2000; // ~4409 lbs
  }
  if (classLower.includes("truck") || classLower.includes("pickup")) {
    return 2200; // ~4850 lbs
  }
  if (classLower.includes("minivan") || classLower.includes("van")) {
    return 2100; // ~4630 lbs
  }

  // Default midsize estimate
  return 1600;
}

/**
 * Convert EPA API vehicle data to our Vehicle interface
 */
export function convertEPAtoVehicle(epaVehicle: EPAVehicle): Vehicle {
  const type = determineVehicleType(epaVehicle.fuelType, epaVehicle.model);
  const baseMpg75 = convertEPAtoBase75(epaVehicle.highway08);
  const massKg = estimateMassByClass(epaVehicle.VClass);

  // Create a unique ID from the EPA vehicle data
  const id = `epa_${epaVehicle.year}_${epaVehicle.make}_${epaVehicle.model}_${epaVehicle.id}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_");

  // Create descriptive name with transmission and drive info
  const transInfo = epaVehicle.trany
    .replace("Automatic", "Auto")
    .replace("Manual", "Manual")
    .split(" ")[0];
  const driveInfo = epaVehicle.drive;

  return {
    id,
    name: `${epaVehicle.year} ${epaVehicle.make} ${epaVehicle.model} (${transInfo}, ${driveInfo})`,
    type,
    baseMpg75,
    massKg,
    year: epaVehicle.year,
    make: epaVehicle.make,
    model: epaVehicle.model,
    trim: `${transInfo}, ${driveInfo}, ${epaVehicle.cylinders}cyl`,
    cityMpg: epaVehicle.city08,
    highwayMpg: epaVehicle.highway08,
    combinedMpg: epaVehicle.comb08,
    source: "epa",
  };
}

/**
 * Fetch vehicle makes from NHTSA vPIC API
 */
export async function fetchVehicleMakes(): Promise<
  { id: number; name: string }[]
> {
  try {
    const response = await fetch(
      "https://vpic.nhtsa.dot.gov/api/vehicles/GetAllMakes?format=json",
      { cache: "force-cache" } // Cache makes list
    );

    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();

    return data.Results.map((make: any) => ({
      id: make.Make_ID,
      name: make.Make_Name,
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching vehicle makes:", error);
    return [];
  }
}

/**
 * Fetch vehicle models for a specific make and year from NHTSA vPIC API
 */
export async function fetchVehicleModels(
  make: string,
  year: number
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`,
      { cache: "force-cache" }
    );

    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();

    const models = data.Results.map((model: any) => model.Model_Name).filter(
      (name: string) => name && name.trim().length > 0
    );

    // Remove duplicates and sort
    return Array.from(new Set(models)).sort();
  } catch (error) {
    console.error("Error fetching vehicle models:", error);
    return [];
  }
}

/**
 * Fetch vehicle data from EPA FuelEconomy.gov API
 */
export async function fetchEPAVehicles(
  year: number,
  make: string,
  model: string
): Promise<Vehicle[]> {
  try {
    const response = await fetch(
      `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      { cache: "no-store" } // Don't cache individual vehicle lookups
    );

    if (!response.ok) {
      throw new Error(`EPA API error: ${response.status}`);
    }

    const data = await response.json();

    // EPA API returns an array of vehicle option IDs
    // We need to fetch details for each ID
    if (!data.menuItem || data.menuItem.length === 0) {
      return [];
    }

    const vehicles: Vehicle[] = [];

    // Fetch details for each vehicle option (limit to first 10 to avoid rate limits)
    const vehicleIds = data.menuItem.slice(0, 10).map((item: any) => item.value);

    for (const vehicleId of vehicleIds) {
      try {
        const detailResponse = await fetch(
          `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`,
          { cache: "no-store" }
        );

        if (detailResponse.ok) {
          const vehicleData = await detailResponse.json();
          const vehicle = convertEPAtoVehicle(vehicleData);
          vehicles.push(vehicle);
        }
      } catch (error) {
        console.error(`Error fetching vehicle ${vehicleId}:`, error);
      }
    }

    return vehicles;
  } catch (error) {
    console.error("Error fetching EPA vehicles:", error);
    return [];
  }
}

/**
 * Fetch vehicle weight from CarQuery API (optional)
 * Returns weight in kg, or null if not found
 */
export async function fetchCarQueryWeight(
  year: number,
  make: string,
  model: string
): Promise<number | null> {
  try {
    // CarQuery API endpoint
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?callback=?&cmd=getTrims&year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      { cache: "force-cache" }
    );

    if (!response.ok) {
      return null;
    }

    const text = await response.text();
    // CarQuery returns JSONP, strip the callback wrapper
    const jsonStr = text.replace(/^\?\(/, "").replace(/\);?$/, "");
    const data = JSON.parse(jsonStr);

    if (data.Trims && data.Trims.length > 0) {
      // Get weight from first trim (in lbs), convert to kg
      const weightLbs = parseInt(data.Trims[0].model_weight_lbs);
      if (weightLbs && weightLbs > 0) {
        return Math.round(weightLbs * 0.453592); // lbs to kg
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching CarQuery weight:", error);
    return null;
  }
}

