// =============================
// File: app/page.tsx (client page that calls the server API)
"use client";
import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { CommuteForm } from "@/components/CommuteForm";
import { ElevationChart } from "@/components/ElevationChart";
import { DEFAULT_VEHICLES } from "@/lib/vehicles";

function usd(x: number) { return x.toLocaleString(undefined, { style: "currency", currency: "USD" }); }

export default function Page() {
  const [values, setValues] = useState({
    home: "Quechee, VT",
    work: "Londonderry, NH",
    gasPrice: 3.5,
    daysPerWeek: 3,
    weeksPerYear: 48,
    winterFrac: 0.25,
    winterPen: 0.1,
    speedShares: { s65: 0, s70: 0, s75: 1 },
    currentVehicleId: "rav4_2017_awd",
    newVehicleId: "mav_hybrid_mid",
    upgradeCost: 20000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/commute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Request failed");
      setData(j);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen cyber-grid">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center py-8">
          <h1 className="cyber-title text-4xl md:text-5xl mb-4">
            COMMUTE COST ANALYZER
          </h1>
          <p className="text-lg text-gray-400 uppercase tracking-wider">
            ELEVATION-AWARE FUEL OPTIMIZATION SYSTEM
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>

        <div className="cyber-card p-6 space-y-6">
          <CommuteForm vehicles={DEFAULT_VEHICLES} values={values} onChange={(p)=>setValues(v=>({...v, ...p}))} />
          <button 
            onClick={run} 
            disabled={loading} 
            className="cyber-button w-full flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="cyber-loader mr-3"></div>
                PROCESSING DATA...
              </>
            ) : (
              <>
                <RefreshCcw className="w-5 h-5 mr-2"/>
                INITIATE ANALYSIS
              </>
            )}
          </button>
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                <span className="font-mono text-sm">ERROR: {error}</span>
              </div>
            </div>
          )}
        </div>

        {data && (
          <>
            <div className="cyber-card p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="cyber-data-flow p-4 rounded-lg">
                  <div className="cyber-label mb-3">CURRENT VEHICLE STATUS</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Annual Fuel Cost:</span>
                      <span className="cyber-glow-text font-bold text-lg">{usd(data.yearlyCur)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekly Cost:</span>
                      <span className="text-white">{usd(data.weeklyCur)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Per Round Trip:</span>
                      <span className="text-white">{usd(data.rtCostCur)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="cyber-data-flow p-4 rounded-lg">
                  <div className="cyber-label mb-3">UPGRADE CANDIDATE</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Annual Fuel Cost:</span>
                      <span className="cyber-glow-text font-bold text-lg">{usd(data.yearlyNew)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weekly Cost:</span>
                      <span className="text-white">{usd(data.weeklyNew)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Per Round Trip:</span>
                      <span className="text-white">{usd(data.rtCostNew)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyber-card p-6">
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div className="cyber-data-flow p-4 rounded-lg">
                  <div className="cyber-label mb-2">ANNUAL SAVINGS</div>
                  <div className="cyber-glow-text text-2xl font-bold">{usd(data.savings)}</div>
                </div>
                <div className="cyber-data-flow p-4 rounded-lg">
                  <div className="cyber-label mb-2">ROI PERCENTAGE</div>
                  <div className="cyber-glow-text text-2xl font-bold">
                    {data.roi !== null ? (data.roi*100).toFixed(2)+"%" : "—"}
                  </div>
                </div>
                <div className="cyber-data-flow p-4 rounded-lg">
                  <div className="cyber-label mb-2">PAYBACK PERIOD</div>
                  <div className="cyber-glow-text text-2xl font-bold">
                    {data.paybackYears ? data.paybackYears.toFixed(1)+" YRS" : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="cyber-card p-6">
              <div className="cyber-label mb-4">ELEVATION PROFILE ANALYSIS</div>
              <div className="bg-black/50 rounded-lg p-4">
                <ElevationChart data={data.elevation} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
