import React, { useEffect, useState } from 'react';
import { paymentsByMethodToday } from '../../../lib/api.analytics';
import { useTenant } from '../../../contexts/TenantContext';

export default function CashierPaymentsByMethod(){
  const { currentSchoolId } = useTenant();
  const [data, setData] = useState(null);
  useEffect(() => { if (!currentSchoolId) return; (async ()=>{ setData(await paymentsByMethodToday()); })(); }, [currentSchoolId]);
  if (!currentSchoolId) return <MiniBanner/>;
  if (!data) return <div>Loading…</div>;
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-xs text-gray-500 mb-1">Payments by Method (Today)</div>
      <ul className="text-sm">
        {Object.entries(data).map(([k,v]) => (
          <li key={k} className="flex justify-between"><span>{String(k)}</span><span>${Number(v).toFixed(2)}</span></li>
        ))}
      </ul>
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}


