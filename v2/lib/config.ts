// =============================
// File: lib/config.ts
// Centralized config. For quick testing we keep a STATIC server-side key here.
// In production, replace with env var (process.env.ORS_API_KEY) and NEVER ship to client.
// The key you provided (Heigit/ORS) is placed below.
export const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjgxZGM5YzI1OWIxZDQ3NTg4OTFjYTVhMzkzM2M0ODU2IiwiaCI6Im11cm11cjY0In0=";

// Elevation API endpoints (free but rate-limited). Swap to Mapbox Terrain-RGB/USGS later.
export const OPEN_ELEVATION_URL = "https://api.open-elevation.com/api/v1/lookup";
export const FALLBACK_ELEVATION_URL = "https://elevation-api.io/api/elevation";

// Default compute constants
export const J_PER_GAL_GAS = 121e6; // ~121 MJ per gallon
export const G = 9.80665; // m/s^2
