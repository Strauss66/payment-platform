import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../contexts/TenantContext';
import { getPortalSummary } from '../../../lib/api.portal';

export default function ParentSummary(){
  const { currentSchoolId } = useTenant();
  const [data, setData] = useState(null);
  const [state, setState] = useState('idle');
  useEffect(() => {
    if (!currentSchoolId) return;
    const controller = new AbortController();
    (async ()=>{
      setState('loading');
      try {
        const d = await getPortalSummary();
        setData(d || {}); setState('idle');
      } catch { if (!controller.signal.aborted) setState('error'); }
    })();
    return () => controller.abort();
  }, [currentSchoolId]);
  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <div className="h-24 rounded-2xl border bg-gray-100 animate-pulse"/>;
  if (state === 'error') return <div className="text-sm text-red-700">Failed to load.</div>;
  const balance = Number(data?.total_balance || 0);
  const nextAmount = Number(data?.next_due_amount || 0);
  const nextDate = data?.next_due_date ? new Date(data.next_due_date).toLocaleDateString() : '—';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <KPI title="Total Balance" value={formatMXN(balance)} />
      <KPI title="Next Due Amount" value={formatMXN(nextAmount)} />
      <KPI title="Next Due Date" value={nextDate} />
    </div>
  );
}

function KPI({ title, value }){
  return (
    <div className="p-4 rounded-2xl border bg-white">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
function MiniBanner(){ return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>; }
function formatMXN(n){ try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; } }


