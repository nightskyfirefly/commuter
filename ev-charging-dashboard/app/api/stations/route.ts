import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ChargingStation } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
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
    
    return NextResponse.json({
      stations,
      states: Array.from(states).sort(),
      total: stations.length
    });
    
  } catch (error) {
    console.error('Error loading station data:', error);
    return NextResponse.json(
      { error: 'Failed to load station data' },
      { status: 500 }
    );
  }
}
