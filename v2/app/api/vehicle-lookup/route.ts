// =============================
// File: app/api/vehicle-lookup/route.ts
// Unified vehicle lookup API with VIN decoding and intelligent fallbacks

import { NextResponse, NextRequest } from "next/server";
import type { VehicleLookupResponse, VehicleCandidate, VINDecodeResult } from "@/lib/types";
import {
  fetchVpicVinDecode,
  fetchEpaOptions,
  fetchEpaVehicle,
  fetchEpaModels,
  fetchVehicleModels,
  fetchCarQueryWeight,
  convertEPAtoBase75,
  determineVehicleType,
  estimateMassByClass,
  stripModelTokens,
  scoreCandidate,
  normalizeMakeModel
} from "@/lib/vehicleLookup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vin = searchParams.get("vin");
    const yearStr = searchParams.get("year");
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const query = searchParams.get("query");

    // Validate input - either VIN or Y/M/M required
    if (vin) {
      if (vin.length !== 17) {
        return NextResponse.json(
          { error: "VIN must be exactly 17 characters" },
          { status: 400 }
        );
      }
      return await handleVinLookup(vin);
    } else if (yearStr && make && model) {
      const year = parseInt(yearStr);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
        return NextResponse.json({ error: "Invalid year" }, { status: 400 });
      }
      return await handleYearMakeModelLookup(year, make, model, query);
    } else {
      return NextResponse.json(
        { error: "Either VIN or year/make/model parameters required" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in /api/vehicle-lookup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to lookup vehicle" },
      { status: 500 }
    );
  }
}

async function handleVinLookup(vin: string): Promise<NextResponse> {
  console.log(`VIN lookup: ${vin}`);

  // Decode VIN using vPIC
  const vinData = await fetchVpicVinDecode(vin);
  if (!vinData) {
    return NextResponse.json(
      { error: "Failed to decode VIN" },
      { status: 404 }
    );
  }

  const year = parseInt(vinData.ModelYear || "0");
  const make = vinData.Make;
  const model = vinData.Model;

  if (!year || !make || !model) {
    return NextResponse.json(
      { error: "VIN decode incomplete - missing year, make, or model" },
      { status: 404 }
    );
  }

  // Use decoded data for Y/M/M lookup
  return await handleYearMakeModelLookup(year, make, model, null, vin);
}

async function handleYearMakeModelLookup(
  year: number,
  make: string,
  model: string,
  query: string | null,
  vin?: string
): Promise<NextResponse> {
  console.log(`Y/M/M lookup: ${year} ${make} ${model}`);

  // Try EPA lookup with exact model first
  let epaOptions = await fetchEpaOptions(year, make, model);
  
  // If no results, try with stripped model tokens
  if (epaOptions.length === 0) {
    const strippedModel = stripModelTokens(model);
    if (strippedModel !== model.toLowerCase()) {
      console.log(`Trying stripped model: ${strippedModel}`);
      epaOptions = await fetchEpaOptions(year, make, strippedModel);
    }
  }

  // If still no results, try vPIC models as fallback
  if (epaOptions.length === 0) {
    console.log("EPA failed, trying vPIC models");
    const vpicModels = await fetchVehicleModels(make, year);
    
    for (const vpicModel of vpicModels.slice(0, 5)) { // Limit to first 5 to avoid rate limits
      const testOptions = await fetchEpaOptions(year, make, vpicModel);
      if (testOptions.length > 0) {
        epaOptions = testOptions;
        console.log(`Found EPA options for vPIC model: ${vpicModel}`);
        break;
      }
    }
  }

  if (epaOptions.length === 0) {
    return NextResponse.json(
      { error: "No matches found", candidates: [] },
      { status: 404 }
    );
  }

  // Score and sort candidates if we have a query or multiple options
  let scoredCandidates: VehicleCandidate[] = [];
  
  if (query || epaOptions.length > 1) {
    const searchText = query || `${year} ${make} ${model}`;
    
    scoredCandidates = epaOptions.map(option => ({
      id: option.value,
      text: option.text,
      score: scoreCandidate(searchText, option.text)
    })).sort((a, b) => b.score - a.score);
  } else {
    // Single option, no scoring needed
    scoredCandidates = [{
      id: epaOptions[0].value,
      text: epaOptions[0].text,
      score: 1.0
    }];
  }

  // Get detailed data for the best candidate
  const bestCandidate = scoredCandidates[0];
  const epaVehicle = await fetchEpaVehicle(bestCandidate.id);
  
  if (!epaVehicle) {
    return NextResponse.json(
      { error: "Failed to fetch vehicle details" },
      { status: 500 }
    );
  }

  // Try to get weight from CarQuery
  let massKg: number | null = null;
  try {
    massKg = await fetchCarQueryWeight(year, make, model);
  } catch (error) {
    console.log("CarQuery weight lookup failed, using EPA estimate");
  }

  // If CarQuery failed, estimate from vehicle class
  if (massKg === null) {
    massKg = estimateMassByClass(epaVehicle.VClass);
  }

  // Build response
  const response: VehicleLookupResponse = {
    sourceIds: {
      epaVehicleId: bestCandidate.id,
      vin: vin || undefined
    },
    epa: {
      city: epaVehicle.city08,
      hwy: epaVehicle.highway08,
      comb: epaVehicle.comb08,
      drive: epaVehicle.drive,
      trany: epaVehicle.trany
    },
    vehicle: {
      id: `epa_${year}_${make}_${model}_${bestCandidate.id}`.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      name: `${year} ${make} ${model} (${epaVehicle.trany.split(" ")[0]}, ${epaVehicle.drive})`,
      type: determineVehicleType(epaVehicle.fuelType, model),
      baseMpg75: convertEPAtoBase75(epaVehicle.highway08),
      massKg
    },
    candidates: scoredCandidates
  };

  console.log(`Found vehicle: ${response.vehicle.name} (${response.vehicle.type})`);

  return NextResponse.json(response, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
