"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: {
    hour: string;
    calls: number;
    isCurrent: boolean;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 text-white p-3 rounded-lg shadow-xl">
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-indigo-400">
          {payload[0].value} <span className="text-neutral-300 font-normal">Calls</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AnalyticsChart({ data }: ChartProps) {
  // Add a gradient for the area
  return (
    <div className="w-full h-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="hour" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            dy={10}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="calls" 
            stroke="#6366f1" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCalls)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
