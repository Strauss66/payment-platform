import React from 'react';

export type MetricCardProps = {
  title: string;
  value: string | number;
  tone?: 'default' | 'danger' | 'muted';
  subtitle?: string;
  loading?: boolean;
};

export function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <div className="h-4 w-32 bg-slate-100 rounded mb-3" />
      <div className="h-8 w-24 bg-slate-100 rounded" />
    </div>
  );
}

export default function MetricCard({ title, value, tone = 'default', subtitle, loading }: MetricCardProps) {
  if (loading) return <MetricCardSkeleton />;
  const valueClass =
    tone === 'danger'
      ? 'text-rose-500'
      : tone === 'muted'
      ? 'text-slate-500'
      : 'text-slate-900';
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className={["mt-2 text-3xl font-semibold", valueClass].join(' ')}>{value}</div>
      {subtitle && <div className="mt-1 text-sm text-slate-500">{subtitle}</div>}
    </div>
  );
}


