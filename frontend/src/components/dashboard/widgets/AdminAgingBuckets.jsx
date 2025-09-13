import React, { useEffect, useState } from 'react';
import { listInvoices, NoTenantError } from '../../../lib/api.billing';
import { useTenant } from '../../../contexts/TenantContext';

export default function AdminAgingBuckets(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [buckets, setBuckets] = useState(null);

  useEffect(() => {
    if (!currentSchoolId) return;
    let cancelled = false;
    const controller = new AbortController();
    (async () => {
      setState('loading');
      try {
        const { rows } = await listInvoices({ status: ['open','partial'], limit: 500 }, { signal: controller.signal });
        if (cancelled) return;
        const result = computeBuckets(rows || []);
        setBuckets(result);
        setState('idle');
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e instanceof NoTenantError) { setState('idle'); return; }
        setState('error');
      }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [currentSchoolId]);

  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => setState('idle')}/>;
  if (!buckets) return null;

  const items = [
    { label: '0-30', value: buckets.b0_30 },
    { label: '31-60', value: buckets.b31_60 },
    { label: '61-90', value: buckets.b61_90 },
    { label: '90+', value: buckets.b90_plus }
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="p-3 rounded border bg-white">
          <div className="text-xs text-gray-500">{it.label} days</div>
          <div className="text-lg font-semibold">{formatCurrency(it.value)}</div>
        </div>
      ))}
    </div>
  );
}

function computeBuckets(invoices){
  const now = new Date();
  const sum = (arr) => arr.reduce((a, b) => a + Number(b || 0), 0);
  const aged = invoices.map(inv => ({
    balance: Number(inv.balance || 0),
    days: daysBetween(now, new Date(inv.due_date))
  }));
  const b0_30 = sum(aged.filter(x => x.days >= 0 && x.days <= 30).map(x => x.balance));
  const b31_60 = sum(aged.filter(x => x.days >= 31 && x.days <= 60).map(x => x.balance));
  const b61_90 = sum(aged.filter(x => x.days >= 61 && x.days <= 90).map(x => x.balance));
  const b90_plus = sum(aged.filter(x => x.days >= 91).map(x => x.balance));
  const outstanding = b0_30 + b31_60 + b61_90 + b90_plus;
  return { b0_30, b31_60, b61_90, b90_plus, outstanding };
}

function daysBetween(a, b){
  const MS = 24*60*60*1000;
  return Math.max(0, Math.floor((a.getTime() - b.getTime()) / MS));
}

function formatCurrency(n){
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n || 0)); } catch { return `$${Number(n||0).toFixed(2)}`; }
}

function Skeleton(){
  return <div className="h-16 bg-gray-100 rounded animate-pulse"/>;
}

function InlineError({ retry }){
  return (
    <div className="text-sm text-red-700">Failed to load. <button className="underline" onClick={retry}>Retry</button></div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}


