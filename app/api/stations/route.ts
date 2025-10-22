import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'ev_stations_clean.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    const stations = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [lat, lon, state, county, access, isFree, hover] = line.split(',');
      
      if (lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
        stations.push({
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          state: state || 'Unknown',
          access: access || 'unknown',
          isFree: isFree === 'True',
          hover: hover || 'Charging Station'
        });
      }
    }
    
    return NextResponse.json({ stations });
    
  } catch (error) {
    console.error('Error loading station data:', error);
    return NextResponse.json(
      { error: 'Failed to load station data' },
      { status: 500 }
    );
  }
}