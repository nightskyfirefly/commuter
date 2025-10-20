// =============================
// File: app/api/vehicle-lookup/route.ts
// Simple vehicle lookup API - EPA only, no complex fallbacks

import { NextResponse, NextRequest } from "next/server";
import type { VehicleLookupResponse, VehicleCandidate } from "@/lib/types";
import {
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
    const yearStr = searchParams.get("year");
    const make = searchParams.get("make");
    const model = searchParams.get("model");

    // Validate input - only Y/M/M for now
    if (!yearStr || !make || !model) {
      return NextResponse.json(
        { error: "Missing required parameters: year, make, and model" },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    console.log(`Simple lookup: ${year} ${make} ${model}`);

    // Try EPA lookup with exact model
    const epaOptions = await fetchEpaOptions(year, make, model);
    
    if (epaOptions.length === 0) {
      return NextResponse.json(
        { error: "No vehicles found matching the criteria", candidates: [] },
        { status: 404 }
      );
    }

    // Use first option (simplified)
    const bestOption = epaOptions[0];
    const epaVehicle = await fetchEpaVehicle(bestOption.value);
    
    if (!epaVehicle) {
      return NextResponse.json(
        { error: "Failed to fetch vehicle details" },
        { status: 500 }
      );
    }

    // Try to get weight from CarQuery (optional)
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

    // Build simple response
    const response: VehicleLookupResponse = {
      sourceIds: {
        epaVehicleId: bestOption.value
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
    console.error("Error in /api/vehicle-lookup:", error);
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
