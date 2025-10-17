"use client";

import React, { useState, useEffect } from "react";
import type { Vehicle } from "@/lib/types";

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
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [customWeight, setCustomWeight] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate year options (current year + 1 down to 1990)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear + 1 - i);

  // Fetch makes on component mount
  useEffect(() => {
    fetchMakes();
  }, []);

  // Fetch models when year and make are selected
  useEffect(() => {
    if (year && selectedMake) {
      fetchModels();
    } else {
      setModels([]);
      setSelectedModel("");
    }
  }, [year, selectedMake]);

  // Fetch vehicles when year, make, and model are selected
  useEffect(() => {
    if (year && selectedMake && selectedModel) {
      fetchVehicles();
    } else {
      setVehicles([]);
      setSelectedVehicle(null);
    }
  }, [year, selectedMake, selectedModel]);

  const fetchMakes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/vehicles/makes");
      if (!response.ok) throw new Error("Failed to fetch makes");
      const data = await response.json();
      setMakes(data.makes || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching makes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/vehicles/models?year=${year}&make=${encodeURIComponent(selectedMake)}`
      );
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      setModels(data.models || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching models:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/vehicles/lookup?year=${year}&make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&includeWeight=true`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch vehicles");
      }
      const data = await response.json();
      setVehicles(data.vehicles || []);
      if (data.vehicles && data.vehicles.length > 0) {
        // Auto-select first vehicle
        handleVehicleSelection(data.vehicles[0]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelection = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCustomWeight(vehicle.massKg.toString());
  };

  const handleConfirm = () => {
    if (!selectedVehicle) return;

    // Apply custom weight if provided
    const finalVehicle = {
      ...selectedVehicle,
      massKg: customWeight ? parseFloat(customWeight) : selectedVehicle.massKg,
    };

    onVehicleSelect(finalVehicle);
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

      {/* Vehicle Trim Selector */}
      {vehicles.length > 0 && (
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider">Trim / Configuration</label>
          <select
            className="cyber-select w-full mt-1"
            value={selectedVehicle?.id || ""}
            onChange={(e) => {
              const vehicle = vehicles.find((v) => v.id === e.target.value);
              if (vehicle) handleVehicleSelection(vehicle);
            }}
            disabled={loading}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.trim || vehicle.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Vehicle Details */}
      {selectedVehicle && (
        <div className="cyber-card p-4 space-y-2">
          <div className="text-sm">
            <div className="text-cyan-400 font-semibold mb-2">{selectedVehicle.name}</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div>
                <span className="text-gray-500">City MPG:</span> {selectedVehicle.cityMpg}
              </div>
              <div>
                <span className="text-gray-500">Highway MPG:</span> {selectedVehicle.highwayMpg}
              </div>
              <div>
                <span className="text-gray-500">Combined MPG:</span> {selectedVehicle.combinedMpg}
              </div>
              <div>
                <span className="text-gray-500">75mph Est:</span> {selectedVehicle.baseMpg75}
              </div>
              <div>
                <span className="text-gray-500">Type:</span> {selectedVehicle.type.toUpperCase()}
              </div>
              <div>
                <span className="text-gray-500">Source:</span> {selectedVehicle.source?.toUpperCase()}
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
              placeholder={`Default: ${selectedVehicle.massKg}kg`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Default: {selectedVehicle.massKg}kg (~{Math.round(selectedVehicle.massKg * 2.20462)} lbs)
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

