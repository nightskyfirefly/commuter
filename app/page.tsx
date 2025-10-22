'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function EVMap() {
  const [stations, setStations] = useState([]);
  const [hoveredStations, setHoveredStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      const response = await fetch('/api/stations');
      const data = await response.json();
      setStations(data.stations);
      setLoading(false);
    } catch (error) {
      console.error('Error loading stations:', error);
      setLoading(false);
    }
  };

  const handleHover = (eventData) => {
    if (eventData.points && eventData.points.length > 0) {
      const point = eventData.points[0];
      const lat = point.lat;
      const lon = point.lon;
      
      // Find stations near the hover point (within ~50 miles)
      const nearbyStations = stations.filter(station => {
        const distance = Math.sqrt(
          Math.pow(station.lat - lat, 2) + Math.pow(station.lon - lon, 2)
        );
        return distance < 0.5; // Rough approximation for ~50 miles
      });
      
      setHoveredStations(nearbyStations);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-xl">Loading charging stations...</div>
      </div>
    );
  }

  const plotData = {
    type: 'scattergeo',
    mode: 'markers',
    lat: hoveredStations.map(s => s.lat),
    lon: hoveredStations.map(s => s.lon),
    text: hoveredStations.map(s => s.hover),
    hoverinfo: 'text',
    marker: {
      size: 8,
      color: '#00ff88',
      opacity: 0.8,
      line: {
        width: 0,
        color: '#ffffff'
      }
    },
    name: 'Charging Stations'
  };

  const layout = {
    geo: {
      scope: 'usa',
      projection: {
        type: 'albers usa'
      },
      bgcolor: 'rgba(0, 0, 0, 0.8)',
      showland: true,
      landcolor: 'rgba(20, 20, 20, 0.8)',
      showlakes: true,
      lakecolor: 'rgba(0, 0, 0, 0.8)',
      showocean: true,
      oceancolor: 'rgba(0, 0, 0, 0.8)',
      coastlinecolor: 'rgba(100, 100, 100, 0.8)',
      subunitcolor: 'rgba(60, 60, 60, 0.8)',
      countrycolor: 'rgba(60, 60, 60, 0.8)',
      showframe: false,
      showcoastlines: true,
      showcountries: true,
      showstates: true,
      lonaxis: {
        range: [-180, -50]
      },
      lataxis: {
        range: [20, 80]
      }
    },
    paper_bgcolor: 'rgba(0, 0, 0, 0.8)',
    plot_bgcolor: 'rgba(0, 0, 0, 0.8)',
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0
    },
    showlegend: false,
    hovermode: 'closest'
  };

  const config = {
    displayModeBar: false,
    responsive: true,
    staticPlot: false
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="w-full h-screen">
        <Plot
          data={[plotData]}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '100%' }}
          onHover={handleHover}
        />
      </div>
    </div>
  );
}