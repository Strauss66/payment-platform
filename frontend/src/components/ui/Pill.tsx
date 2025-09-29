import React from 'react';

type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export default function Pill({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }){
  const map: Record<Tone, { bg: string; text: string }> = {
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-700' },
    neutral: { bg: 'bg-slate-100', text: 'text-slate-700' },
  };
  const c = map[tone] || map.neutral;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>{children}</span>
  );
}


