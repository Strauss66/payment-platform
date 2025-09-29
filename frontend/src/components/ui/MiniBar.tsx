import React from 'react';

type Item = { label: string; percent: number };

export default function MiniBar({ items }: { items: Item[] }){
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm text-slate-600">{it.label}</span>
            <span className="text-sm font-medium text-slate-900">{Math.round(it.percent)}%</span>
          </div>
          <div className="w-48 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-slate-900" style={{ width: `${Math.max(0, Math.min(100, it.percent))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}


