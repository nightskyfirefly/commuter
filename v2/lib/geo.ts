// =============================
// File: lib/geo.ts (server-only)
import { ORS_API_KEY } from "./config";

export async function geocodeORS(query: string): Promise<[number, number] | null> {
  console.log(`Geocoding query: "${query}"`);
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(query)}`;
  console.log(`Geocoding URL: ${url}`);
  
  const r = await fetch(url);
  console.log(`Geocoding response status: ${r.status}`);
  
  if (!r.ok) {
    const errorText = await r.text();
    console.error(`Geocoding error: ${r.status} - ${errorText}`);
    return null;
  }
  
  const j = await r.json();
  console.log(`Geocoding response:`, j);
  
  const f = j?.features?.[0];
  if (f) {
    const coords: [number, number] = [f.geometry.coordinates[0], f.geometry.coordinates[1]]; // [lon, lat]
    console.log(`Geocoding result: ${coords}`);
    return coords;
  }
  
  console.log('No geocoding results found');
  return null;
}

export async function routeORS(start: [number, number], end: [number, number]) {
  console.log(`Routing from ${start} to ${end}`);
  const body = {
    coordinates: [start, end],
    instructions: false,
    preference: "fastest",
    radiuses: [-1, -1],
  };
  console.log('Routing request body:', body);
  
  const r = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ORS_API_KEY,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  
  console.log(`Routing response status: ${r.status}`);
  
  if (!r.ok) {
    const errorText = await r.text();
    console.error(`Routing error: ${r.status} - ${errorText}`);
    throw new Error(`Routing failed: ${r.status} - ${errorText}`);
  }
  
  const j = await r.json();
  console.log(`Routing response features: ${j.features?.length || 0}`);
  
  if (!j.features || !j.features[0] || !j.features[0].geometry || !j.features[0].geometry.coordinates) {
    console.error('Invalid routing response:', j);
    throw new Error("Invalid routing response format");
  }
  
  const coords: [number, number][] = j.features[0].geometry.coordinates;
  console.log(`Routing result: ${coords.length} coordinate points`);
  return coords; // [lon,lat] list
}
