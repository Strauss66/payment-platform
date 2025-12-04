import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../contexts/TenantContext';
import { usePaymentMethodMix } from '../../../hooks/useMetrics';

export default function CashierPaymentsByMethod(){
  const { currentSchoolId } = useTenant();
  const to = new Date(); const from = new Date(); from.setDate(to.getDate()-0); from.setHours(0,0,0,0);
  const { data, isLoading } = usePaymentMethodMix({ params: { from: from.toISOString(), to: to.toISOString() } });
  if (!currentSchoolId) return <MiniBanner/>;
  if (isLoading || !data) return <div>Loading…</div>;
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-xs text-gray-500 mb-1">Payments by Method (Today)</div>
      {data.length === 0 ? (
        <div className="text-sm text-gray-600">No data</div>
      ) : (
        <ul className="text-sm">
          {data.map((r, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{labelForMethod(r.payment_method_id)}</span>
              <span>{formatMXN(r.total_amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function labelForMethod(id){
  const map = { 1: 'Cash', 2: 'POS', 3: 'Transfer', 4: 'Online' };
  return map[id] || `Method ${id}`;
}
function formatMXN(n){
  try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; }
}


