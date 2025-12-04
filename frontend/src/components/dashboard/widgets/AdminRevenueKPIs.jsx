import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../contexts/TenantContext';
import { useMetricsOverview } from '../../../hooks/useMetrics';

export default function AdminRevenueKPIs(){
  const { currentSchoolId } = useTenant();
  const { data, isLoading, error } = useMetricsOverview({});
  const kpi = {
    today_collections: Number(data?.today_collections || 0),
    pending_invoices: Number(data?.pending_invoices || 0),
    overdue_invoices: Number(data?.overdue_invoices || 0)
  };

  if (!currentSchoolId) return <MiniBanner />;
  if (isLoading) return <Skeleton/>;
  if (error) return <InlineError retry={() => window.location.reload()}/>;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-600">Key revenue metrics</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI title="Collected (Today)" value={formatCurrencyMXN(kpi.today_collections)} />
        <KPI title="Pending Invoices" value={String(kpi.pending_invoices)} />
        <KPI title="Overdue Invoices" value={String(kpi.overdue_invoices)} />
      </div>
    </div>
  );
}

function KPI({ title, value }){
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

// period selector removed for MVP metrics

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function Skeleton(){
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-2/3"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="h-16 bg-gray-200 rounded"/>
        <div className="h-16 bg-gray-200 rounded"/>
        <div className="h-16 bg-gray-200 rounded"/>
        <div className="h-16 bg-gray-200 rounded"/>
      </div>
    </div>
  );
}

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });
function formatCurrencyMXN(n){ const x = Number(n || 0); return mxn.format(Math.round(x * 100) / 100); }

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
      We couldn’t load this data. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}


