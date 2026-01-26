// =============================
// File: lib/config.ts
// Centralized config using environment variables for security
// Set ORS_API_KEY in your environment (.env.local for local dev, Vercel env vars for production)
export const ORS_API_KEY = process.env.ORS_API_KEY || "";

// Elevation API endpoints (free but rate-limited). Swap to Mapbox Terrain-RGB/USGS later.
export const OPEN_ELEVATION_URL = "https://api.open-elevation.com/api/v1/lookup";
export const FALLBACK_ELEVATION_URL = "https://elevation-api.io/api/elevation";

// Default compute constants
export const J_PER_GAL_GAS = 121e6; // ~121 MJ per gallon
export const G = 9.80665; // m/s^2
