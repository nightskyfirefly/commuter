// =============================
// File: app/debug/page.tsx
// Debug page to test API functionality
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testData = {
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
  };

  async function testAPI() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing API with data:', testData);
      const response = await fetch("/api/commute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testData),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (e: any) {
      console.error('API test error:', e);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>
      
      <div className="space-y-4">
        <Button onClick={testAPI} disabled={loading}>
          {loading ? "Testing..." : "Test API"}
        </Button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Test Data:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
