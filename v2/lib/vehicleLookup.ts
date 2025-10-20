// =============================
// File: lib/vehicleLookup.ts
// Utility functions for vehicle API lookups and MPG conversion

import type { Vehicle, VehicleKind, EPAVehicle } from "./types";

// In-memory cache for EPA menu endpoints
const epaMenuCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour

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
 * Fetch vehicle makes - returns curated list of popular manufacturers
 * This ensures a clean, user-friendly list without obscure or non-automotive brands
 */
export async function fetchVehicleMakes(): Promise<
  { id: number; name: string }[]
> {
  // Curated list of popular automotive manufacturers
  // IDs are not critical here since we query by name in subsequent API calls
  const popularMakes = [
    { id: 1, name: "BMW" },
    { id: 2, name: "Ford" },
    { id: 3, name: "Honda" },
    { id: 4, name: "Jeep" },
    { id: 5, name: "Rivian" },
    { id: 6, name: "Subaru" },
    { id: 7, name: "Tesla" },
    { id: 8, name: "Toyota" },
    { id: 9, name: "Volkswagen" },
  ];

  return popularMakes;
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

    const models: string[] = data.Results.map((model: any) => model.Model_Name).filter(
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
      `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&format=json`,
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
          `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}?format=json`,
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

/**
 * Normalize make/model string to extract year, make, model and strip tokens
 */
export function normalizeMakeModel(str: string): {
  year?: number;
  make?: string;
  model?: string;
  tokens: string[];
} {
  const tokens = str.toLowerCase().split(/\s+/);
  const result: { year?: number; make?: string; model?: string; tokens: string[] } = {
    tokens: []
  };

  // Extract year (4 digits at start)
  const yearMatch = str.match(/^(\d{4})\s+/);
  if (yearMatch) {
    result.year = parseInt(yearMatch[1]);
    tokens.shift(); // Remove year from tokens
  }

  // Common tokens to strip
  const stripTokens = ['hybrid', 'hev', 'phev', 'awd', '4wd', 'fwd', 'xle', 'limited', 'sport', 'se', 'le'];
  
  // Filter out strip tokens and collect them
  const filteredTokens = tokens.filter(token => {
    if (stripTokens.includes(token)) {
      result.tokens.push(token);
      return false;
    }
    return true;
  });

  // First remaining token is likely make, rest is model
  if (filteredTokens.length >= 2) {
    result.make = filteredTokens[0];
    result.model = filteredTokens.slice(1).join(' ');
  }

  return result;
}

/**
 * Strip common model tokens for better EPA matching
 */
export function stripModelTokens(model: string): string {
  const tokens = ['hybrid', 'hev', 'phev', 'awd', '4wd', 'fwd', 'xle', 'limited', 'sport', 'se', 'le'];
  let stripped = model.toLowerCase();
  
  for (const token of tokens) {
    const regex = new RegExp(`\\b${token}\\b`, 'gi');
    stripped = stripped.replace(regex, '').trim();
  }
  
  // Clean up extra spaces
  return stripped.replace(/\s+/g, ' ').trim();
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,      // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Score candidate match based on token overlap and Levenshtein distance
 */
export function scoreCandidate(userQuery: string, optionText: string): number {
  const userTokens = userQuery.toLowerCase().split(/\s+/);
  const optionTokens = optionText.toLowerCase().split(/\s+/);
  
  // Token overlap score (0-1)
  const overlap = userTokens.filter(token => optionTokens.includes(token)).length;
  const tokenScore = overlap / Math.max(userTokens.length, optionTokens.length);
  
  // Levenshtein distance score (0-1, higher is better)
  const maxLen = Math.max(userQuery.length, optionText.length);
  const levenshteinScore = maxLen > 0 ? 1 - (levenshteinDistance(userQuery, optionText) / maxLen) : 0;
  
  // Weighted combination: 60% token overlap, 40% Levenshtein
  return tokenScore * 0.6 + levenshteinScore * 0.4;
}

/**
 * Fetch available models from EPA menu API with caching
 */
export async function fetchEpaModels(year: number, make: string): Promise<string[]> {
  const cacheKey = `models_${year}_${make}`;
  const cached = epaMenuCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${encodeURIComponent(make)}&format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`EPA models API error: ${response.status}`);
    }

    const data = await response.json();
    const models = data.menuItem?.map((item: any) => item.value) || [];
    
    epaMenuCache.set(cacheKey, { data: models, timestamp: Date.now() });
    return models;
  } catch (error) {
    console.error("Error fetching EPA models:", error);
    return [];
  }
}

/**
 * Fetch vehicle options from EPA menu API with caching
 */
export async function fetchEpaOptions(year: number, make: string, model: string): Promise<{ text: string; value: string }[]> {
  const cacheKey = `options_${year}_${make}_${model}`;
  const cached = epaMenuCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`EPA options API error: ${response.status}`);
    }

    const data = await response.json();
    const options = data.menuItem?.map((item: any) => ({ text: item.text, value: item.value })) || [];
    
    epaMenuCache.set(cacheKey, { data: options, timestamp: Date.now() });
    return options;
  } catch (error) {
    console.error("Error fetching EPA options:", error);
    return [];
  }
}

/**
 * Fetch detailed vehicle data from EPA
 */
export async function fetchEpaVehicle(vehicleId: string): Promise<EPAVehicle | null> {
  try {
    const response = await fetch(
      `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}?format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`EPA vehicle API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching EPA vehicle ${vehicleId}:`, error);
    return null;
  }
}

/**
 * Fetch VIN decode data from vPIC API
 */
export async function fetchVpicVinDecode(vin: string): Promise<any> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVINValuesExtended/${vin}?format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`vPIC VIN API error: ${response.status}`);
    }

    const data = await response.json();
    return data.Results?.[0] || null;
  } catch (error) {
    console.error("Error fetching VIN decode:", error);
    return null;
  }
}

