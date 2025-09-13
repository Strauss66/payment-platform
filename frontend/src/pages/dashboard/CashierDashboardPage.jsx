import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { api } from '../../lib/apiClient';
import { paymentsByMethodToday } from '../../lib/api.analytics';
import CashierSessionStatus from '../../components/dashboard/widgets/CashierSessionStatus';
import CashierPaymentsByMethod from '../../components/dashboard/widgets/CashierPaymentsByMethod';
import CashierTodayKPIs from '../../components/dashboard/widgets/CashierTodayKPIs';
import CashierInvoicesDue from '../../components/dashboard/widgets/cashier/CashierInvoicesDue';
import CashierQuickActions from '../../components/dashboard/widgets/cashier/CashierQuickActions';

function Banner(){
  return <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function Card({ title, children }){
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="font-semibold mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}

export default function CashierDashboardPage(){
  const { currentSchoolId, needsSelection } = useTenant();
  const [registers, setRegisters] = useState([]);
  const [session, setSession] = useState(null);
  const [agg, setAgg] = useState(null);
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const { data } = await api.get('/api/billing/cash-registers');
        setRegisters(data);
        const a = await paymentsByMethodToday();
        setAgg(a);
        setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);

  const disabled = !currentSchoolId || needsSelection;

  return (
    <ProtectedRoute>
      <RoleGate roles={[ROLES.CASHIER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">Cashier Dashboard</h1>
          {disabled && <Banner />}
          {!disabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <CashierSessionStatus />
              <CashierPaymentsByMethod />
              <CashierQuickActions sessionOpen={false} />
              <div className="md:col-span-2 xl:col-span-2"><Card title="Today KPIs"><CashierTodayKPIs /></Card></div>
              <div className="md:col-span-2 xl:col-span-3"><Card title="Invoices Due (Next 7d)"><CashierInvoicesDue /></Card></div>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


