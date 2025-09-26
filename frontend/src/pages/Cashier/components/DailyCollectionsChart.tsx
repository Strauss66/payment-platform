import React from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type DailyPoint = { day: string; amount: number };

export default function DailyCollectionsChart({ data = defaultData }: { data?: DailyPoint[] }) {
  const hasData = data && data.length > 0;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-slate-900 font-semibold">Daily Collections</h3>
          <p className="text-sm text-slate-600">Last 7 Days</p>
        </div>
      </div>
      <div className="mt-4 h-64">
        {!hasData ? (
          <div className="h-full rounded-xl border border-dashed border-slate-200 grid place-items-center text-slate-400 text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis hide domain={[0, 'dataMax + 200']} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Collections']} cursor={{ stroke: '#e2e8f0' }} />
              <Line type="monotone" dataKey="amount" stroke="#0f172a" strokeWidth={2} dot={{ r: 3, stroke: '#0f172a', fill: 'white' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const defaultData: DailyPoint[] = [
  { day: 'Mon', amount: 200 },
  { day: 'Tue', amount: 320 },
  { day: 'Wed', amount: 180 },
  { day: 'Thu', amount: 540 },
  { day: 'Fri', amount: 380 },
  { day: 'Sat', amount: 120 },
  { day: 'Sun', amount: 210 },
];


