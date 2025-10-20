"use client";

import React, { useState, useEffect } from "react";
import type { Vehicle, VehicleLookupResponse } from "@/lib/types";

interface VehicleSearchProps {
  onVehicleSelect: (vehicle: Vehicle) => void;
  label?: string;
}

export default function VehicleSearch({ onVehicleSelect, label = "Search Vehicle" }: VehicleSearchProps) {
  const [year, setYear] = useState<string>("");
  const [makes, setMakes] = useState<{ id: number; name: string }[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [lookupResult, setLookupResult] = useState<VehicleLookupResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [customWeight, setCustomWeight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate year options (current year + 1 down to 1990)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear + 1 - i);

  // Fetch makes on component mount
  useEffect(() => {
    // Use hardcoded makes for now to avoid API dependency
    setMakes([
      { id: 1, name: "BMW" },
      { id: 2, name: "Ford" },
      { id: 3, name: "Honda" },
      { id: 4, name: "Jeep" },
      { id: 5, name: "Rivian" },
      { id: 6, name: "Subaru" },
      { id: 7, name: "Tesla" },
      { id: 8, name: "Toyota" },
      { id: 9, name: "Volkswagen" },
    ]);
  }, []);

  // Fetch models when year and make are selected
  useEffect(() => {
    if (year && selectedMake) {
      // Use hardcoded models for common makes to avoid API dependency
      const commonModels: { [key: string]: string[] } = {
        "Ford": ["Maverick", "F-150", "Explorer", "Escape", "Mustang"],
        "Toyota": ["RAV4", "Camry", "Prius", "Highlander", "Corolla"],
        "Honda": ["Civic", "Accord", "CR-V", "Pilot", "HR-V"],
        "BMW": ["3 Series", "5 Series", "X3", "X5", "i3"],
        "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
        "Subaru": ["Outback", "Forester", "Impreza", "Legacy", "Crosstrek"],
        "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade"],
        "Volkswagen": ["Jetta", "Passat", "Tiguan", "Atlas", "Golf"],
        "Rivian": ["R1T", "R1S"]
      };
      
      setModels(commonModels[selectedMake] || []);
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [year, selectedMake]);

  // Perform lookup when year, make, and model are selected
  useEffect(() => {
    if (year && selectedMake && selectedModel) {
      performLookup();
    } else {
      setLookupResult(null);
      setSelectedCandidate("");
    }
  }, [year, selectedMake, selectedModel]);


  const performLookup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `/api/vehicle-lookup?year=${year}&make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}`;

      console.log("Testing URL:", url);
      const response = await fetch(url);
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to lookup vehicle");
      }
      
      const data: VehicleLookupResponse = await response.json();
      console.log("Response data:", data);
      setLookupResult(data);
      
      // Auto-select first candidate
      if (data.candidates.length > 0) {
        setSelectedCandidate(data.candidates[0].id);
        setCustomWeight(data.vehicle.massKg?.toString() || "");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error performing lookup:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!lookupResult) return;

    // Convert lookup result to Vehicle format
    const vehicle: Vehicle = {
      id: lookupResult.vehicle.id,
      name: lookupResult.vehicle.name,
      type: lookupResult.vehicle.type,
      baseMpg75: lookupResult.vehicle.baseMpg75,
      massKg: customWeight ? parseFloat(customWeight) : lookupResult.vehicle.massKg || 1600,
      year: parseInt(year) || undefined,
      make: selectedMake || undefined,
      model: selectedModel || undefined,
      cityMpg: lookupResult.epa.city,
      highwayMpg: lookupResult.epa.hwy,
      combinedMpg: lookupResult.epa.comb,
      source: "epa"
    };

    onVehicleSelect(vehicle);
  };

  return (
    <div className="space-y-4">
      <label className="cyber-label block text-sm font-medium uppercase tracking-wider">
        {label}
      </label>

      {/* Year Selector */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Year</label>
        <select
          className="cyber-select w-full mt-1"
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setSelectedMake("");
            setSelectedModel("");
          }}
          disabled={loading}
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Make Selector */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Make</label>
        <select
          className="cyber-select w-full mt-1"
          value={selectedMake}
          onChange={(e) => {
            setSelectedMake(e.target.value);
            setSelectedModel("");
          }}
          disabled={!year || loading || makes.length === 0}
        >
          <option value="">Select Make</option>
          {makes.map((make) => (
            <option key={make.id} value={make.name}>
              {make.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selector */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider">Model</label>
        <select
          className="cyber-select w-full mt-1"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={!selectedMake || loading || models.length === 0}
        >
          <option value="">Select Model</option>
          {models.map((model, idx) => (
            <option key={idx} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>


      {/* Vehicle Candidates */}
      {lookupResult && lookupResult.candidates.length > 0 && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">
            Available Configurations
          </label>
          <select
            className="cyber-select w-full mt-1"
            value={selectedCandidate}
            onChange={(e) => setSelectedCandidate(e.target.value)}
            disabled={loading}
          >
            {lookupResult.candidates.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.text} (Score: {(candidate.score * 100).toFixed(0)}%)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vehicle Details */}
      {lookupResult && (
        <div className="cyber-card p-4 space-y-2">
          <div className="text-sm">
            <div className="text-pink-400 font-semibold mb-2">{lookupResult.vehicle.name}</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>
                <span className="text-gray-500">City MPG:</span> {lookupResult.epa.city}
              </div>
              <div>
                <span className="text-gray-500">Highway MPG:</span> {lookupResult.epa.hwy}
              </div>
              <div>
                <span className="text-gray-500">Combined MPG:</span> {lookupResult.epa.comb}
              </div>
              <div>
                <span className="text-gray-500">75mph Est:</span> {lookupResult.vehicle.baseMpg75}
              </div>
              <div>
                <span className="text-gray-500">Type:</span> {lookupResult.vehicle.type.toUpperCase()}
              </div>
              <div>
                <span className="text-gray-500">Drive:</span> {lookupResult.epa.drive}
              </div>
              <div>
                <span className="text-gray-500">Transmission:</span> {lookupResult.epa.trany}
              </div>
              <div>
                <span className="text-gray-500">Source:</span> EPA
              </div>
            </div>
          </div>

          {/* Custom Weight Override */}
          <div className="pt-2 border-t border-gray-700">
            <label className="text-xs text-gray-400 uppercase tracking-wider">
              Vehicle Weight (kg) - Optional Override
            </label>
            <input
              type="number"
              className="cyber-input w-full mt-1"
              value={customWeight}
              onChange={(e) => setCustomWeight(e.target.value)}
              placeholder={`Default: ${lookupResult.vehicle.massKg || 'Unknown'}kg`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: {lookupResult.vehicle.massKg || 'Unknown'}kg 
              {lookupResult.vehicle.massKg && ` (~${Math.round(lookupResult.vehicle.massKg * 2.20462)} lbs)`}
            </p>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="cyber-button w-full mt-2"
            disabled={loading}
          >
            Use This Vehicle
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="cyber-loader mx-auto mb-2"></div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="cyber-card border-red-500/50 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

