// =============================
// File: components/CommuteForm.tsx (client)
"use client";
import React from "react";
import type { Vehicle } from "@/lib/types";

export function CommuteForm(props: {
  vehicles: Vehicle[];
  values: any;
  onChange: (patch: any) => void;
}) {
  const { vehicles, values, onChange } = props;
  return (
    <div className="grid md:grid-cols-3 gap-6">
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
      
      <div className="space-y-4">
        <div>
          <label className="cyber-label block mb-2">CURRENT VEHICLE</label>
          <select 
            className="cyber-select w-full" 
            value={values.currentVehicleId} 
            onChange={(e)=>onChange({currentVehicleId:e.target.value})}
          >
            {vehicles.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label className="cyber-label block mb-2">UPGRADE CANDIDATE</label>
          <select 
            className="cyber-select w-full" 
            value={values.newVehicleId} 
            onChange={(e)=>onChange({newVehicleId:e.target.value})}
          >
            {vehicles.map(v=> <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
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
      
      <div className="space-y-4">
        <div>
          <label className="cyber-label block mb-2">SPEED DISTRIBUTION</label>
          <p className="text-xs text-gray-500 mb-3">Must sum to 1.0</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="cyber-label text-xs block mb-1">65 MPH</label>
              <input 
                type="number" 
                step="0.01" 
                className="cyber-input w-full" 
                value={values.speedShares.s65} 
                onChange={e=>onChange({speedShares:{...values.speedShares, s65:parseFloat(e.target.value||"0")}})} 
              />
            </div>
            <div>
              <label className="cyber-label text-xs block mb-1">70 MPH</label>
              <input 
                type="number" 
                step="0.01" 
                className="cyber-input w-full" 
                value={values.speedShares.s70} 
                onChange={e=>onChange({speedShares:{...values.speedShares, s70:parseFloat(e.target.value||"0")}})} 
              />
            </div>
            <div>
              <label className="cyber-label text-xs block mb-1">75 MPH</label>
              <input 
                type="number" 
                step="0.01" 
                className="cyber-input w-full" 
                value={values.speedShares.s75} 
                onChange={e=>onChange({speedShares:{...values.speedShares, s75:parseFloat(e.target.value||"0")}})} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
