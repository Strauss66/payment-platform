import React, { useEffect, useState } from 'react';
import { listInvoices } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';

export default function AdminCashForecast(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const to = new Date(); to.setDate(to.getDate() + 30);
        const from = new Date();
        const { rows } = await listInvoices({ status: 'open', dueFrom: from.toISOString(), dueTo: to.toISOString() });
        const sum = rows.reduce((s, r) => s + Number(r.balance || 0), 0);
        setTotal(sum); setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);

  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;

  return (
    <div className="p-1">
      <div className="text-sm text-gray-600">Expected collections (next 30 days)</div>
      <div className="text-2xl font-semibold">${total.toFixed(2)}</div>
      <div className="text-xs text-gray-500 mt-1">Estimate based on due/open invoices.</div>
    </div>
  );
}

function Skeleton(){
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-5/6"/>
      <div className="h-6 bg-gray-200 rounded w-1/2"/>
      <div className="h-3 bg-gray-200 rounded w-3/4"/>
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


