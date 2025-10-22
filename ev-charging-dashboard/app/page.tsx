'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChargingStation, StationFilters, StationStats } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import LoadingOverlay from '@/components/LoadingOverlay';

// Dynamically import Plot component to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function Dashboard() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ChargingStation[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StationFilters>({
    state: '',
    access: '',
    free: ''
  });

  useEffect(() => {
    loadStationData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stations, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStationData = async () => {
    try {
      const response = await fetch('/api/stations');
      if (!response.ok) {
        throw new Error('Failed to load station data');
      }
      const data = await response.json();
      setStations(data.stations);
      setStates(data.states);
      setLoading(false);
    } catch (err) {
      console.error('Error loading station data:', err);
      setError('Failed to load station data');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = stations.filter(station => {
      const stateMatch = !filters.state || station.state === filters.state;
      const accessMatch = !filters.access || station.access === filters.access;
      const freeMatch = !filters.free || station.isFree.toString() === filters.free;
      
      return stateMatch && accessMatch && freeMatch;
    });
    
    setFilteredStations(filtered);
  };

  const updateFilters = (newFilters: Partial<StationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const stats: StationStats = {
    total: filteredStations.length,
    public: filteredStations.filter(s => s.access === 'public').length,
    free: filteredStations.filter(s => s.isFree).length,
    states: new Set(filteredStations.map(s => s.state)).size
  };

  const plotData = {
    type: 'scattergeo' as const,
    mode: 'markers' as const,
    lat: filteredStations.map(s => s.lat),
    lon: filteredStations.map(s => s.lon),
    text: filteredStations.map(s => s.hover),
    hoverinfo: 'text' as const,
    marker: {
      size: filteredStations.map(s => s.isFree ? 8 : 6),
      color: filteredStations.map(s => s.isFree ? '#ffd700' : '#ff6b35'),
      opacity: 0.8,
      line: {
        width: 1,
        color: '#ffffff'
      }
    },
    name: 'EV Charging Stations'
  };

  const plotLayout = {
    geo: {
      scope: 'usa' as const,
      projection: {
        type: 'albers usa' as const
      },
      bgcolor: 'rgba(3, 12, 24, 0.8)',
      showland: true,
      landcolor: 'rgba(4, 18, 36, 0.8)',
      showlakes: true,
      lakecolor: 'rgba(5, 20, 40, 0.8)',
      showocean: true,
      oceancolor: 'rgba(3, 12, 24, 0.8)',
      coastlinecolor: 'rgba(20, 40, 80, 0.8)',
      subunitcolor: 'rgba(25, 50, 100, 0.8)',
      countrycolor: 'rgba(25, 50, 100, 0.8)',
      showframe: false,
      showcoastlines: true,
      showcountries: true,
      showstates: true,
      lonaxis: {
        range: [-180, -50] as [number, number]
      },
      lataxis: {
        range: [20, 80] as [number, number]
      }
    },
    paper_bgcolor: 'rgba(3, 12, 24, 0.8)',
    plot_bgcolor: 'rgba(3, 12, 24, 0.8)',
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0
    },
    showlegend: false,
    hovermode: 'closest' as const
  };

  const plotConfig = {
    displayModeBar: false,
    responsive: true,
    staticPlot: false
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-aurora-blue via-aurora-dark to-aurora-darker">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-aurora-accent mb-4">Error Loading Data</h1>
          <p className="text-aurora-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aurora-blue via-aurora-dark to-aurora-darker">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] h-screen">
        <Sidebar
          states={states}
          filters={filters}
          stats={stats}
          onFilterChange={updateFilters}
        />
        
        <div className="relative bg-aurora-blue">
          <div className="w-full h-full">
            <Plot
              data={[plotData]}
              layout={plotLayout}
              config={plotConfig}
              style={{ width: '100%', height: '100%' }}
              className="glow-effect"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
