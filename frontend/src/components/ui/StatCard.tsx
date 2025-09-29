import React from 'react';

type Trend = { value: number; direction: 'up' | 'down' };
type Props = {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: Trend;
  icon?: React.ReactNode;
};

export default function StatCard({ title, value, subtext, trend, icon }: Props){
  return (
    <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-card)] border border-[var(--border)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-[var(--text-muted)]">{title}</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight text-[var(--text)]">{value}</div>
          {subtext && <div className="text-sm text-[var(--text-muted)] mt-1">{subtext}</div>}
        </div>
        {icon && <div className="shrink-0 text-[var(--text-muted)]">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-2 inline-flex items-center gap-1 text-sm ${trend.direction==='up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          <span>{trend.direction === 'up' ? '▲' : '▼'}</span>
          <span>{trend.value}%</span>
        </div>
      )}
    </div>
  );
}


