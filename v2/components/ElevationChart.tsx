// =============================
// File: components/ElevationChart.tsx (client)
"use client";
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export function ElevationChart({ data }: { data: number[] }) {
  const chart = data.map((y, i) => ({ x: i, y }));
  return (
    <div className="h-64 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-400/10 via-pink-400/10 to-transparent rounded-lg"></div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chart} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff6ec7" stopOpacity={0.9}/> {/* Aurora Pink */}
              <stop offset="50%" stopColor="#5ce1e6" stopOpacity={0.7}/> {/* Aurora Teal */}
              <stop offset="100%" stopColor="#b794f6" stopOpacity={0.5}/> {/* Aurora Purple */}
            </linearGradient>
            <filter id="aurora-glow">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
            </filter>
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
            tick={{ fill: '#8a8a9a', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(v)=>[`${Math.round(Number(v))}m`, 'Elevation']}
            labelFormatter={(label) => `Point ${label}`}
            contentStyle={{
              backgroundColor: '#131318',
              border: '1px solid #2a2a38',
              borderRadius: '8px',
              color: '#f5f5ff',
              boxShadow: '0 0 20px rgba(255, 110, 199, 0.2)'
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
