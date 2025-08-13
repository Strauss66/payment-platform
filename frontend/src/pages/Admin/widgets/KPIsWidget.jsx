import React, { useEffect, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';

// type KPIs = { totalStudents: number; arBalance: number; overdueInvoices: number; activeUsers: number; trend: { arBalancePct: number; overduePct: number } }

export default function KPIsWidget(){
  const [data, setData] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getAdminKPIs();
      setData(data);
    })();
  }, []);

  return (
    <WidgetShell title="KPIs" to="/app/admin/reports">
      {!data ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Kpi label="Total Students" value={data.totalStudents.toLocaleString()} />
          <Kpi label="A/R Balance" value={`$${data.arBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} trend={data.trend.arBalancePct} />
          <Kpi label="Overdue Invoices" value={data.overdueInvoices.toLocaleString()} trend={data.trend.overduePct} />
          <Kpi label="Active Users" value={data.activeUsers.toLocaleString()} />
        </div>
      )}
    </WidgetShell>
  );
}

function Kpi({ label, value, trend }){
  return (
    <div className="rounded border p-3 bg-white">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {typeof trend === 'number' && (
        <div className={`text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{trend >= 0 ? '+' : ''}{trend}%</div>
      )}
    </div>
  );
}

