// =============================
// File: lib/math.ts (shared)
import { G } from "./config";

export function haversine(a: [number, number], b: [number, number]) {
  const R = 6371000; // meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function densify(coords: [number, number][], stepM = 100): [number, number][] {
  console.log(`Densifying ${coords.length} coordinates with ${stepM}m step`);
  console.log('Input coordinates sample:', coords.slice(0, 3));
  
  if (coords.length < 2) return coords;
  const out: [number, number][] = [coords[0]];
  
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    const dist = haversine(a, b);
    
    if (dist <= stepM) { 
      out.push(b); 
      continue; 
    }
    
    const n = Math.floor(dist / stepM);
    for (let k = 1; k <= n; k++) {
      const t = (k * stepM) / dist;
      const lon = a[0] + (b[0] - a[0]) * t;
      const lat = a[1] + (b[1] - a[1]) * t;
      out.push([lon, lat]);
    }
    out.push(b);
  }
  
  console.log(`Densification complete: ${out.length} coordinates`);
  console.log('Output coordinates sample:', out.slice(0, 3));
  return out;
}
