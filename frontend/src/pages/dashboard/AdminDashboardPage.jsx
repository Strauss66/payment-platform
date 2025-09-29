import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { agingBuckets } from '../../lib/api.analytics';
import AdminRevenueKPIs from '../../components/dashboard/widgets/AdminRevenueKPIs';
import AdminAgingBuckets from '../../components/dashboard/widgets/AdminAgingBuckets';
import AdminReceivablesSpeed from '../../components/dashboard/widgets/admin/AdminReceivablesSpeed';
import AdminCashForecast from '../../components/dashboard/widgets/admin/AdminCashForecast';
import AdminTopDebtors from '../../components/dashboard/widgets/admin/AdminTopDebtors';
import AdminDunningQueue from '../../components/dashboard/widgets/admin/AdminDunningQueue';
import AdminOpsFeed from '../../components/dashboard/widgets/admin/AdminOpsFeed';
import PageHeader from '../../components/ui/PageHeader.tsx';

function Banner(){
  return <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function Card({ title, children }){
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="font-medium mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}

export default function AdminDashboardPage(){
  const { currentSchoolId, needsSelection } = useTenant();
  const [aging, setAging] = useState(null);
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const a = await agingBuckets();
        setAging(a);
        setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);

  const disabled = !currentSchoolId || needsSelection;

  return (
    <ProtectedRoute>
      <RoleGate roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="space-y-4">
          <PageHeader title="Admin Billing Dashboard" />
          {disabled && <Banner />}
          {!disabled && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-4"><Card title="Revenue KPIs"><AdminRevenueKPIs /></Card></div>
              <div className="xl:col-span-4"><Card title="Aging Buckets"><AdminAgingBuckets /></Card></div>
              <div className="xl:col-span-4"><Card title="Receivables Speed"><AdminReceivablesSpeed /></Card></div>

              <div className="xl:col-span-6"><Card title="Top Debtors"><AdminTopDebtors /></Card></div>
              <div className="xl:col-span-6"><Card title="Dunning Queue"><AdminDunningQueue /></Card></div>

              <div className="xl:col-span-12"><Card title="Ops Feed"><AdminOpsFeed /></Card></div>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


