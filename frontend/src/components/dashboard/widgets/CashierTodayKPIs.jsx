import React, { useEffect, useState } from 'react';
import { listPayments } from '../../../lib/api.billing';
import { useMetricsOverview } from '../../../hooks/useMetrics';
import { useTenant } from '../../../contexts/TenantContext';

export default function CashierTodayKPIs(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [kpi, setKpi] = useState({ count: 0, total: 0, avg: 0 });
  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const to = new Date(); const from = new Date(); from.setHours(0,0,0,0);
        const [paymentsRes] = await Promise.all([
          listPayments({ from: from.toISOString(), to: to.toISOString() })
        ]);
        const rows = paymentsRes.rows || [];
        const count = rows.length;
        const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
        const avg = count ? (todayCollections / count) : 0;
        setKpi({ count, total: todayCollections, avg }); setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);
  const { data: overviewData } = useMetricsOverview({});
  const todayCollections = Number(overviewData?.today_collections || 0);
  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <div>Loading…</div>;
  if (state === 'error') return <div className="text-red-600">Failed to load</div>;
  return (
    <div className="grid grid-cols-3 gap-3">
      <KPI title="Payments (Today)" value={String(kpi.count)} />
      <KPI title="Collected (Today)" value={formatMXN(kpi.total)} />
      <KPI title="Avg Ticket" value={formatMXN(kpi.avg)} />
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

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function formatMXN(n){
  try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; }
}


