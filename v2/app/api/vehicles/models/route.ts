// =============================
// File: app/api/vehicles/models/route.ts
// API endpoint to fetch vehicle models for a make/year from NHTSA

import { NextResponse, NextRequest } from "next/server";
import { fetchVehicleModels } from "@/lib/vehicleLookup";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const make = searchParams.get("make");
    const yearStr = searchParams.get("year");

    if (!make || !yearStr) {
      return NextResponse.json(
        { error: "Missing required parameters: make and year" },
        { status: 400 }
      );
    }

    const year = parseInt(yearStr);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: "Invalid year" }, { status: 400 });
    }

    const models = await fetchVehicleModels(make, year);

    return NextResponse.json({ models }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/vehicles/models:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vehicle models" },
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

