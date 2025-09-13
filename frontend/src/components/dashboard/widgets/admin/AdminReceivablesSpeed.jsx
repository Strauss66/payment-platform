import React, { useEffect, useState } from 'react';
import { listInvoices, listPayments } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';

export default function AdminReceivablesSpeed(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [vals, setVals] = useState({ dso: 0, turnover: 0 });
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const invOpen = await listInvoices({ status: 'open' });
        const ar = invOpen.rows.reduce((s, r) => s + Number(r.balance || 0), 0);
        const to = new Date(); const from = new Date(to.getFullYear(), 0, 1);
        const pays = await listPayments({ from: from.toISOString(), to: to.toISOString() });
        const sales = pays.rows.reduce((s, r) => s + Number(r.amount || 0), 0);
        const avgAr = ar; // approximation due to limited data
        const dso = sales > 0 ? (avgAr / sales) * 365 : 0;
        const turnover = avgAr > 0 ? (sales / avgAr) : 0;
        setVals({ dso, turnover }); setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);

  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;

  return (
    <div>
      <div className="mb-2 text-xs text-gray-600">Receivables speed <button className="underline" onClick={()=>setInfoOpen(v=>!v)} aria-expanded={infoOpen}>What’s this?</button></div>
      {infoOpen && (
        <div className="mb-2 text-xs text-gray-600">
          DSO ≈ (Average AR ÷ Net Credit Sales) × 365. AR Turnover = Net Credit Sales ÷ Average AR.
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <KPI title="DSO (days)" value={vals.dso.toFixed(1)} tooltip="(Avg AR ÷ Net Credit Sales) × 365" />
        <KPI title="AR Turnover (x)" value={vals.turnover.toFixed(2)} tooltip="Net Credit Sales ÷ Avg AR" />
      </div>
    </div>
  );
}

function KPI({ title, value, tooltip }){
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-xs text-gray-500 flex items-center gap-1" title={tooltip}>{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Skeleton(){
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-5/6"/>
      <div className="h-6 bg-gray-200 rounded w-3/5"/>
      <div className="h-4 bg-gray-200 rounded w-4/5"/>
    </div>
  );
}

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
      We couldn’t load this data. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}


