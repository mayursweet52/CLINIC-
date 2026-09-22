'use client';
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function VitalsChart({ vitals }: { vitals: any[] }) {
  const data = vitals?.length ? vitals : [
    { date: 'Jan 10', bpSys: 120, bpDia: 80, weight: 70 },
    { date: 'Feb 15', bpSys: 118, bpDia: 78, weight: 69 },
    { date: 'Mar 20', bpSys: 122, bpDia: 82, weight: 68 },
    { date: 'Apr 05', bpSys: 120, bpDia: 80, weight: 68.5 },
  ];

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="bpSys" stroke="#ef4444" name="BP Systolic" />
          <Line yAxisId="left" type="monotone" dataKey="bpDia" stroke="#f59e0b" name="BP Diastolic" />
          <Line yAxisId="right" type="monotone" dataKey="weight" stroke="#3b82f6" name="Weight (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
