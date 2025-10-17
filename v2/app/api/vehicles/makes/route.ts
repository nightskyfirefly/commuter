// =============================
// File: app/api/vehicles/makes/route.ts
// API endpoint to fetch vehicle makes from NHTSA

import { NextResponse } from "next/server";
import { fetchVehicleMakes } from "@/lib/vehicleLookup";

export async function GET() {
  try {
    const makes = await fetchVehicleMakes();

    return NextResponse.json({ makes }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/vehicles/makes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch vehicle makes" },
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

