// =============================
// File: app/api/vehicle-lookup/route.ts
// Simplified vehicle lookup API with VIN decoding and basic EPA lookup

import { NextResponse, NextRequest } from "next/server";
import type { VehicleLookupResponse, VehicleCandidate } from "@/lib/types";
import {
  fetchVpicVinDecode,
  fetchEpaOptions,
  fetchEpaVehicle,
  fetchCarQueryWeight,
  convertEPAtoBase75,
  determineVehicleType,
  estimateMassByClass
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

  try {
    // Try EPA lookup with exact model
    const epaOptions = await fetchEpaOptions(year, make, model);
    
    if (epaOptions.length === 0) {
      return NextResponse.json(
        { error: "No matches found", candidates: [] },
        { status: 404 }
      );
    }

    // Use first option for now (simplified)
    const bestOption = epaOptions[0];
    const epaVehicle = await fetchEpaVehicle(bestOption.value);
    
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
        epaVehicleId: bestOption.value,
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
        id: `epa_${year}_${make}_${model}_${bestOption.value}`.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
        name: `${year} ${make} ${model} (${epaVehicle.trany.split(" ")[0]}, ${epaVehicle.drive})`,
        type: determineVehicleType(epaVehicle.fuelType, model),
        baseMpg75: convertEPAtoBase75(epaVehicle.highway08),
        massKg
      },
      candidates: epaOptions.map(option => ({
        id: option.value,
        text: option.text,
        score: 1.0
      }))
    };

    console.log(`Found vehicle: ${response.vehicle.name} (${response.vehicle.type})`);

    return NextResponse.json(response, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Error in Y/M/M lookup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to lookup vehicle" },
      { status: 500 }
    );
  }
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
