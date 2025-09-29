import React from 'react';
import { Line, LineChart as RLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

type Props<T extends Record<string, any>> = {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  height?: number;
};

export default function LineChart<T extends Record<string, any>>({ data, xKey, yKey, height = 240 }: Props<T>){
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" />
          <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip cursor={{ stroke: '#e2e8f0' }} />
          <Line type="monotone" dataKey={yKey} stroke="#0f172a" strokeWidth={2} dot={{ r: 3, stroke: '#0f172a', fill: 'white' }} />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}


