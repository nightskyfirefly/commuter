// =============================
// File: lib/elevation.ts (server-only)
import { OPEN_ELEVATION_URL, FALLBACK_ELEVATION_URL } from "./config";

// Simple cache to avoid repeated requests
const elevationCache = new Map<string, number>();

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - wait with exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Request failed, retrying in ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function sampleOpenElevation(points: [number, number][]) {
  console.log(`Starting elevation lookup for ${points.length} points`);
  
  // Check cache first
  const cachedElevs: (number | null)[] = points.map(([lon, lat]) => {
    const key = getCacheKey(lat, lon);
    return elevationCache.get(key) ?? null;
  });
  
  const uncachedIndices: number[] = [];
  cachedElevs.forEach((elev, index) => {
    if (elev === null) uncachedIndices.push(index);
  });
  
  console.log(`Found ${points.length - uncachedIndices.length} cached elevations, need to fetch ${uncachedIndices.length}`);
  
  if (uncachedIndices.length === 0) {
    console.log('All elevations found in cache');
    return cachedElevs as number[];
  }
  
  // Fetch uncached elevations
  const uncachedPoints = uncachedIndices.map(i => points[i]);
  const chunkSize = 50; // Reduced from 100 to avoid rate limits
  const elevs: (number | null)[] = [...cachedElevs];
  
  for (let i = 0; i < uncachedPoints.length; i += chunkSize) {
    const chunk = uncachedPoints.slice(i, i + chunkSize);
    const locations = chunk.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
    
    console.log(`Processing chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(uncachedPoints.length/chunkSize)} with ${chunk.length} points`);
    
    try {
      let r: Response;
      let j: any;
      
      // Try primary API first
      try {
        console.log('Trying primary elevation API...');
        r = await fetchWithRetry(OPEN_ELEVATION_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ locations }),
          cache: "no-store",
        });
        
        console.log(`Primary elevation API response status: ${r.status}`);
        
        if (!r.ok) {
          const errorText = await r.text();
          console.error(`Primary elevation API error: ${r.status} - ${errorText}`);
          throw new Error(`Primary API failed: ${r.status} - ${errorText}`);
        }
        
        j = await r.json();
        console.log(`Primary elevation API response: ${j.results?.length || 0} results`);
        
        if (!j.results || !Array.isArray(j.results)) {
          console.error('Invalid primary elevation API response:', j);
          throw new Error("Invalid primary elevation API response format");
        }
        
      } catch (primaryError) {
        console.log('Primary API failed, trying fallback...');
        
        // Try fallback API
        try {
          r = await fetchWithRetry(FALLBACK_ELEVATION_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ points: locations }),
            cache: "no-store",
          });
          
          console.log(`Fallback elevation API response status: ${r.status}`);
          
          if (!r.ok) {
            const errorText = await r.text();
            console.error(`Fallback elevation API error: ${r.status} - ${errorText}`);
            throw new Error(`Fallback API failed: ${r.status} - ${errorText}`);
          }
          
          j = await r.json();
          console.log(`Fallback elevation API response: ${j.elevations?.length || 0} results`);
          
          if (!j.elevations || !Array.isArray(j.elevations)) {
            console.error('Invalid fallback elevation API response:', j);
            throw new Error("Invalid fallback elevation API response format");
          }
          
          // Convert fallback format to primary format
          j.results = j.elevations.map((elev: number) => ({ elevation: elev }));
          
        } catch (fallbackError) {
          console.error('Both elevation APIs failed:', { primaryError, fallbackError });
          throw new Error(`All elevation APIs failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
        }
      }
      
      // Cache the results and update the elevs array
      chunk.forEach(([lon, lat], chunkIndex) => {
        const elevation = j.results[chunkIndex]?.elevation;
        if (elevation !== undefined) {
          const key = getCacheKey(lat, lon);
          elevationCache.set(key, elevation);
          
          // Find the original index and update
          const originalIndex = uncachedIndices[i + chunkIndex];
          elevs[originalIndex] = elevation;
        }
      });
      
      console.log(`Sample elevations: ${j.results.slice(0, 3).map((r: any) => r.elevation)}`);
      
      // Add delay between chunks to be respectful to the API
      if (i + chunkSize < uncachedPoints.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds
      }
      
    } catch (error) {
      console.error(`Elevation chunk error:`, error);
      throw error;
    }
  }
  
  console.log(`Elevation lookup complete: ${elevs.length} elevations retrieved`);
  return elevs.filter((e): e is number => e !== null); // meters
}
