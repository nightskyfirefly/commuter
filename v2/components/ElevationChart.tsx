// =============================
// File: components/ElevationChart.tsx (client)
"use client";
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export function ElevationChart({ data }: { data: number[] }) {
  const chart = data.map((y, i) => ({ x: i, y }));
  return (
    <div className="h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-green-400/10 to-transparent rounded-lg"></div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff88" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#0088ff" stopOpacity={0.6}/>
              <stop offset="100%" stopColor="#ff0088" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="x" 
            tick={false} 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            width={60} 
            domain={["dataMin-20", "dataMax+20"]} 
            tickFormatter={(v)=>`${Math.round(Number(v))}m`}
            tick={{ fill: '#888888', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(v)=>[`${Math.round(Number(v))}m`, 'Elevation']}
            labelFormatter={(label) => `Point ${label}`}
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '6px',
              color: '#ffffff'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="y" 
            dot={false} 
            stroke="url(#elevationGradient)"
            strokeWidth={3}
            strokeDasharray="0"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
