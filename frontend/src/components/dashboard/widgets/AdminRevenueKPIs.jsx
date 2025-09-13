import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices, listPayments, NoTenantError } from '../../../lib/api.billing';
import { useTenant } from '../../../contexts/TenantContext';
import { computeOnTimeRate } from '../../../lib/api.analytics';

export default function AdminRevenueKPIs(){
  const { currentSchoolId } = useTenant();
  const [state, setState] = useState('idle');
  const [period, setPeriod] = useState('MTD'); // Today | MTD | YTD
  const [kpi, setKpi] = useState({ collected: 0, outstanding: 0, onTimeRate: 0, activeStudents: 0 });

  const { from, to } = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);
    if (period === 'Today') {
      start.setHours(0,0,0,0);
    } else if (period === 'MTD') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'YTD') {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return { from: start, to: end };
  }, [period]);

  useEffect(() => {
    if (!currentSchoolId) return;
    const controller = new AbortController();
    (async () => {
      setState('loading');
      try {
        const [invOpen, payments, invPaid] = await Promise.all([
          listInvoices({ status: 'open' }, { signal: controller.signal }),
          listPayments({ from: from.toISOString(), to: to.toISOString() }, { signal: controller.signal }),
          listInvoices({ status: 'paid', paidFrom: from.toISOString(), paidTo: to.toISOString() }, { signal: controller.signal })
        ]);

        const outstanding = (invOpen.rows || []).reduce((sum, r) => sum + Number(r.balance || 0), 0);
        const collected = (payments.rows || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
        const onTimeRate = computeOnTimeRate(invPaid.rows || []);
        const activeSet = new Set((invOpen.rows || []).map(r => r.student_id).filter(Boolean));
        const activeStudents = activeSet.size;

        setKpi({ collected, outstanding, onTimeRate, activeStudents });
        setState('idle');
      } catch (e) {
        if (e?.name === 'NoTenantError') { setState('idle'); return; }
        if (controller.signal.aborted) return;
        setState('error');
      }
    })();
    return () => controller.abort();
  }, [currentSchoolId, from, to]);

  if (!currentSchoolId) return <MiniBanner />;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Key revenue metrics</div>
        <PeriodSelector period={period} onChange={setPeriod} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI title={`Collected (${period})`} value={formatCurrency(kpi.collected)} />
        <KPI title="Outstanding AR" value={formatCurrency(kpi.outstanding)} />
        <KPI title="On-time Rate" value={formatPercent(kpi.onTimeRate)} />
        <KPI title="Active Students" value={String(kpi.activeStudents)} />
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

function PeriodSelector({ period, onChange }){
  return (
    <div role="tablist" aria-label="Select period" className="inline-flex rounded border overflow-hidden">
      {['Today','MTD','YTD'].map(p => (
        <button
          key={p}
          role="tab"
          aria-selected={period === p}
          onClick={() => onChange(p)}
          className={`px-3 py-1.5 text-sm ${period === p ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'} border-r last:border-r-0`}
        >{p}</button>
      ))}
    </div>
  );
}

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

const currencyFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const percentFormatter = new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 0 });
function formatCurrency(n){ const x = Number(n || 0); return currencyFormatter.format(Math.round(x * 100) / 100); }
function formatPercent(r){ const x = Math.max(0, Math.min(1, Number(r || 0))); return percentFormatter.format(x); }

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
      We couldn’t load this data. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}


