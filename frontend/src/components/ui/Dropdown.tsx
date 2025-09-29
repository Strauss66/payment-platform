import React from 'react';

type Option = { value: string; label: string };

export default function Dropdown({ label, options = [], value, onChange }: { label: string; options: Option[]; value?: string; onChange?: (v: string)=>void }){
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-slate-600">{label}</span>
      <select className="border rounded-lg px-2 py-1.5 bg-white" value={value || ''} onChange={(e)=>onChange?.(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}


