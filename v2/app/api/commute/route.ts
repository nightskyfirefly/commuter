// =============================
// File: app/api/commute/route.ts (Next.js App Router, server)
import { NextRequest, NextResponse } from "next/server";
import { geocodeORS, routeORS } from "@/lib/geo";
import { densify } from "@/lib/math";
import { sampleOpenElevation } from "@/lib/elevation";
import { computeOneWayFuelGallons } from "@/lib/energy";
import { DEFAULT_VEHICLES } from "@/lib/vehicles";
import type { ComputeInput, ComputeResult, Vehicle } from "@/lib/types";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('API request received');
    const body = (await req.json()) as ComputeInput;
    console.log('Request body:', body);
    const vehicles: Vehicle[] = body.vehicles?.length ? body.vehicles : DEFAULT_VEHICLES;
    const current = vehicles.find(v => v.id === body.currentVehicleId);
    const target = vehicles.find(v => v.id === body.newVehicleId);
    if (!current || !target) return NextResponse.json({ error: "Vehicle not found" }, { status: 400 });

    console.log('Geocoding addresses...');
    const a = await geocodeORS(body.home);
    const b = await geocodeORS(body.work);
    console.log('Geocoding results:', { home: a, work: b });
    if (!a || !b) return NextResponse.json({ error: "Geocoding failed" }, { status: 400 });

    console.log('Getting route...');
    const coords = await routeORS(a, b);
    console.log('Route coordinates:', coords.length, 'points');
    const dens = densify(coords, 200); // Increased from 100m to 200m to reduce elevation points
    console.log('Densified route:', dens.length, 'points');
    console.log('Getting elevation data...');
    const elev = await sampleOpenElevation(dens);
    console.log('Elevation data:', elev.length, 'points');

    const outCur = computeOneWayFuelGallons(dens, elev, current, body.gasPrice, body.speedShares);
    const backCur = computeOneWayFuelGallons([...dens].reverse(), [...elev].reverse(), current, body.gasPrice, body.speedShares);
    const outNew = computeOneWayFuelGallons(dens, elev, target, body.gasPrice, body.speedShares);
    const backNew = computeOneWayFuelGallons([...dens].reverse(), [...elev].reverse(), target, body.gasPrice, body.speedShares);

    const winterMult = 1 + body.winterFrac * body.winterPen;
    const rtCostCur = (outCur.cost + backCur.cost) * winterMult;
    const rtCostNew = (outNew.cost + backNew.cost) * winterMult;

    const weeklyCur = rtCostCur * body.daysPerWeek;
    const weeklyNew = rtCostNew * body.daysPerWeek;
    const yearlyCur = weeklyCur * body.weeksPerYear;
    const yearlyNew = weeklyNew * body.weeksPerYear;
    const savings = yearlyCur - yearlyNew;

    const roi = body.upgradeCost > 0 ? savings / body.upgradeCost : null;
    const paybackYears = body.upgradeCost > 0 && savings > 0 ? body.upgradeCost / savings : null;

    const res: ComputeResult = {
      distanceMi: outCur.distanceMiles + backCur.distanceMiles,
      elevation: elev,
      rtCostCur, rtCostNew, weeklyCur, weeklyNew, yearlyCur, yearlyNew,
      savings, roi, paybackYears,
    };
    const response = NextResponse.json(res);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return response;
  } catch (e: any) {
    console.error('API error:', e);
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
