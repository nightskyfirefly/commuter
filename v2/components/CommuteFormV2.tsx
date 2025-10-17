// =============================
// File: components/CommuteFormV2.tsx (client)
// Enhanced version with vehicle search integration
"use client";
import React, { useState } from "react";
import type { Vehicle } from "@/lib/types";
import VehicleSearch from "./VehicleSearch";

export function CommuteFormV2(props: {
  vehicles: Vehicle[];
  values: any;
  onChange: (patch: any) => void;
  onCustomVehicleAdd: (vehicle: Vehicle, slot: 'current' | 'new') => void;
}) {
  const { vehicles, values, onChange, onCustomVehicleAdd } = props;
  const [showCurrentSearch, setShowCurrentSearch] = useState(false);
  const [showNewSearch, setShowNewSearch] = useState(false);

  const handleCurrentVehicleSelect = (vehicle: Vehicle) => {
    onCustomVehicleAdd(vehicle, 'current');
    setShowCurrentSearch(false);
  };

  const handleNewVehicleSelect = (vehicle: Vehicle) => {
    onCustomVehicleAdd(vehicle, 'new');
    setShowNewSearch(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Column 1: Route & Basic Settings */}
      <div className="space-y-4">
        <div>
          <label className="cyber-label block mb-2">HOME LOCATION</label>
          <input 
            className="cyber-input w-full" 
            value={values.home} 
            onChange={e=>onChange({home:e.target.value})} 
            placeholder="Enter home address"
          />
        </div>
        <div>
          <label className="cyber-label block mb-2">WORK LOCATION</label>
          <input 
            className="cyber-input w-full" 
            value={values.work} 
            onChange={e=>onChange({work:e.target.value})} 
            placeholder="Enter work address"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="cyber-label block mb-2">GAS PRICE ($/GAL)</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full" 
              value={values.gasPrice} 
              onChange={e=>onChange({gasPrice:parseFloat(e.target.value||"0")})} 
            />
          </div>
          <div>
            <label className="cyber-label block mb-2">DAYS/WEEK</label>
            <input 
              type="number" 
              className="cyber-input w-full" 
              value={values.daysPerWeek} 
              onChange={e=>onChange({daysPerWeek:parseInt(e.target.value||"0")})} 
            />
          </div>
          <div>
            <label className="cyber-label block mb-2">WEEKS/YEAR</label>
            <input 
              type="number" 
              className="cyber-input w-full" 
              value={values.weeksPerYear} 
              onChange={e=>onChange({weeksPerYear:parseInt(e.target.value||"0")})} 
            />
          </div>
          <div>
            <label className="cyber-label block mb-2">UPGRADE COST ($)</label>
            <input 
              type="number" 
              className="cyber-input w-full" 
              value={values.upgradeCost} 
              onChange={e=>onChange({upgradeCost:parseFloat(e.target.value||"0")})} 
            />
          </div>
        </div>
      </div>
      
      {/* Column 2: Vehicle Selection */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="cyber-label">CURRENT VEHICLE</label>
            <button
              type="button"
              onClick={() => setShowCurrentSearch(!showCurrentSearch)}
              className="text-xs text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
            >
              {showCurrentSearch ? "Hide Search" : "Search Vehicle"}
            </button>
          </div>
          
          {showCurrentSearch ? (
            <VehicleSearch 
              onVehicleSelect={handleCurrentVehicleSelect}
              label=""
            />
          ) : (
            <select 
              className="cyber-select w-full" 
              value={values.currentVehicleId} 
              onChange={(e)=>onChange({currentVehicleId:e.target.value})}
            >
              {vehicles.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="cyber-label">UPGRADE CANDIDATE</label>
            <button
              type="button"
              onClick={() => setShowNewSearch(!showNewSearch)}
              className="text-xs text-cyan-400 hover:text-cyan-300 uppercase tracking-wider"
            >
              {showNewSearch ? "Hide Search" : "Search Vehicle"}
            </button>
          </div>
          
          {showNewSearch ? (
            <VehicleSearch 
              onVehicleSelect={handleNewVehicleSelect}
              label=""
            />
          ) : (
            <select 
              className="cyber-select w-full" 
              value={values.newVehicleId} 
              onChange={(e)=>onChange({newVehicleId:e.target.value})}
            >
              {vehicles.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <label className="cyber-label block mb-2">WINTER FRACTION</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full" 
              value={values.winterFrac} 
              onChange={e=>onChange({winterFrac:parseFloat(e.target.value||"0")})} 
            />
          </div>
          <div>
            <label className="cyber-label block mb-2">WINTER PENALTY</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full" 
              value={values.winterPen} 
              onChange={e=>onChange({winterPen:parseFloat(e.target.value||"0")})} 
            />
          </div>
        </div>
      </div>
      
      {/* Column 3: Speed Mix */}
      <div className="space-y-4">
        <label className="cyber-label block mb-2">SPEED MIX</label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">65 MPH SHARE</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full mt-1" 
              value={values.speedShares.s65} 
              onChange={e=>onChange({speedShares:{...values.speedShares, s65:parseFloat(e.target.value||"0")}})} 
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">70 MPH SHARE</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full mt-1" 
              value={values.speedShares.s70} 
              onChange={e=>onChange({speedShares:{...values.speedShares, s70:parseFloat(e.target.value||"0")}})} 
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">75 MPH SHARE</label>
            <input 
              type="number" 
              step="0.01" 
              className="cyber-input w-full mt-1" 
              value={values.speedShares.s75} 
              onChange={e=>onChange({speedShares:{...values.speedShares, s75:parseFloat(e.target.value||"0")}})} 
            />
          </div>
        </div>
        <div className="cyber-card p-3 mt-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">TOTAL</div>
          <div className="text-xl font-bold text-cyan-400">
            {((values.speedShares.s65 + values.speedShares.s70 + values.speedShares.s75) * 100).toFixed(0)}%
          </div>
          {(values.speedShares.s65 + values.speedShares.s70 + values.speedShares.s75) !== 1 && (
            <div className="text-xs text-yellow-400 mt-1">Should equal 100%</div>
          )}
        </div>
      </div>
    </div>
  );
}

