// =============================
// File: app/api/vehicles/lookup/route.ts
// API endpoint to fetch vehicle details from EPA with optional CarQuery weight

import { NextResponse, NextRequest } from "next/server";
import { fetchEPAVehicles, fetchCarQueryWeight } from "@/lib/vehicleLookup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearStr = searchParams.get("year");
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const includeWeight = searchParams.get("includeWeight") === "true";

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

    console.log(`Looking up vehicles: ${year} ${make} ${model}`);

    // Fetch vehicles from EPA
    const vehicles = await fetchEPAVehicles(year, make, model);

    if (vehicles.length === 0) {
      return NextResponse.json(
        { error: "No vehicles found matching the criteria" },
        { status: 404 }
      );
    }

    // Optionally fetch weight from CarQuery for the first vehicle
    let carQueryWeight: number | null = null;
    if (includeWeight) {
      carQueryWeight = await fetchCarQueryWeight(year, make, model);
      if (carQueryWeight) {
        console.log(`CarQuery weight for ${year} ${make} ${model}: ${carQueryWeight}kg`);
        // Update all vehicles with the CarQuery weight if found
        vehicles.forEach((v) => {
          v.massKg = carQueryWeight!;
          v.source = "carquery";
        });
      }
    }

    console.log(`Found ${vehicles.length} vehicle(s)`);

    return NextResponse.json(
      { vehicles, carQueryWeight },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in /api/vehicles/lookup:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vehicle data" },
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

