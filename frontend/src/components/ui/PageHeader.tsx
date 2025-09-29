import React from 'react';

export default function PageHeader({ title, subtitle, rightSlot }:{ title: string; subtitle?: string; rightSlot?: React.ReactNode }){
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}


