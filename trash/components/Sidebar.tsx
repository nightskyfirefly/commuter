'use client';

import { StationFilters, StationStats } from '@/lib/types';

interface SidebarProps {
  states: string[];
  filters: StationFilters;
  stats: StationStats;
  onFilterChange: (filters: Partial<StationFilters>) => void;
}

export default function Sidebar({ states, filters, stats, onFilterChange }: SidebarProps) {
  return (
    <div className="bg-aurora-sidebar/95 backdrop-blur-xl border-r border-aurora-border/30 p-6 overflow-y-auto shadow-2xl">
      <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-aurora-accent to-yellow-400 bg-clip-text text-transparent">
        EV Charging Stations
      </h1>
      <p className="text-aurora-muted text-sm mb-8 leading-relaxed">
        Interactive dashboard showing electric vehicle charging stations across the United States
      </p>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="stateFilter" className="block text-xs font-semibold text-aurora-muted mb-2 uppercase tracking-wide">
            State
          </label>
          <select
            id="stateFilter"
            value={filters.state}
            onChange={(e) => onFilterChange({ state: e.target.value })}
            className="w-full bg-aurora-dark/80 border border-aurora-border/50 rounded-xl px-4 py-3 text-aurora-text text-sm transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-aurora-accent focus:shadow-lg focus:shadow-aurora-accent/10 focus:bg-aurora-dark/90"
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="accessFilter" className="block text-xs font-semibold text-aurora-muted mb-2 uppercase tracking-wide">
            Access Type
          </label>
          <select
            id="accessFilter"
            value={filters.access}
            onChange={(e) => onFilterChange({ access: e.target.value })}
            className="w-full bg-aurora-dark/80 border border-aurora-border/50 rounded-xl px-4 py-3 text-aurora-text text-sm transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-aurora-accent focus:shadow-lg focus:shadow-aurora-accent/10 focus:bg-aurora-dark/90"
          >
            <option value="">All Access Types</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="freeFilter" className="block text-xs font-semibold text-aurora-muted mb-2 uppercase tracking-wide">
            Free Charging
          </label>
          <select
            id="freeFilter"
            value={filters.free}
            onChange={(e) => onFilterChange({ free: e.target.value })}
            className="w-full bg-aurora-dark/80 border border-aurora-border/50 rounded-xl px-4 py-3 text-aurora-text text-sm transition-all duration-300 backdrop-blur-sm focus:outline-none focus:border-aurora-accent focus:shadow-lg focus:shadow-aurora-accent/10 focus:bg-aurora-dark/90"
          >
            <option value="">All Charging Types</option>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-aurora-dark/60 border border-aurora-border/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-aurora-accent/30 hover:shadow-lg hover:shadow-black/20">
          <div className="text-2xl font-bold text-aurora-accent mb-1">
            {stats.total.toLocaleString()}
          </div>
          <div className="text-xs text-aurora-muted uppercase tracking-wide">
            Total Stations
          </div>
        </div>
        
        <div className="bg-aurora-dark/60 border border-aurora-border/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-aurora-accent/30 hover:shadow-lg hover:shadow-black/20">
          <div className="text-2xl font-bold text-aurora-accent mb-1">
            {stats.public.toLocaleString()}
          </div>
          <div className="text-xs text-aurora-muted uppercase tracking-wide">
            Public
          </div>
        </div>
        
        <div className="bg-aurora-dark/60 border border-aurora-border/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-aurora-accent/30 hover:shadow-lg hover:shadow-black/20">
          <div className="text-2xl font-bold text-aurora-accent mb-1">
            {stats.free.toLocaleString()}
          </div>
          <div className="text-xs text-aurora-muted uppercase tracking-wide">
            Free
          </div>
        </div>
        
        <div className="bg-aurora-dark/60 border border-aurora-border/30 rounded-xl p-4 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-aurora-accent/30 hover:shadow-lg hover:shadow-black/20">
          <div className="text-2xl font-bold text-aurora-accent mb-1">
            {stats.states}
          </div>
          <div className="text-xs text-aurora-muted uppercase tracking-wide">
            States
          </div>
        </div>
      </div>
    </div>
  );
}
