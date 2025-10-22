import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ChargingStation } from '@/lib/types';

// Cache the parsed data to avoid re-parsing on every request
let cachedStations: ChargingStation[] | null = null;
let cachedStates: string[] | null = null;

function loadStationData() {
  if (cachedStations && cachedStates) {
    return { stations: cachedStations, states: cachedStates };
  }

  const csvPath = path.join(process.cwd(), 'public', 'ev_stations_clean.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n');
  
  const stations: ChargingStation[] = [];
  const states = new Set<string>();
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [lat, lon, state, county, access, isFree, hover] = line.split(',');
    
    if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
      const station: ChargingStation = {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        state: state || 'Unknown',
        county: county || 'Unknown',
        access: (access as 'public' | 'private' | 'unknown') || 'unknown',
        isFree: isFree === 'True',
        hover: hover || 'Unknown Station'
      };
      
      stations.push(station);
      if (state) states.add(state);
    }
  }
  
  cachedStations = stations;
  cachedStates = Array.from(states).sort();
  
  return { stations, states: cachedStates };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get viewport bounds for filtering
    const north = searchParams.get('north');
    const south = searchParams.get('south');
    const east = searchParams.get('east');
    const west = searchParams.get('west');
    
    const { stations, states } = loadStationData();
    
    let filteredStations = stations;
    
    // If viewport bounds are provided, filter stations to only those in view
    if (north && south && east && west) {
      const northLat = parseFloat(north);
      const southLat = parseFloat(south);
      const eastLon = parseFloat(east);
      const westLon = parseFloat(west);
      
      filteredStations = stations.filter(station => 
        station.lat >= southLat && 
        station.lat <= northLat && 
        station.lon >= westLon && 
        station.lon <= eastLon
      );
    }
    
    return NextResponse.json({
      stations: filteredStations,
      states,
      total: stations.length,
      filtered: filteredStations.length
    });
    
  } catch (error) {
    console.error('Error loading station data:', error);
    return NextResponse.json(
      { error: 'Failed to load station data' },
      { status: 500 }
    );
  }
}
