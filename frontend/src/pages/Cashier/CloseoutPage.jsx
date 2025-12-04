import React, { useEffect, useState } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { listPayments } from '../../lib/api.billing';

export default function CloseoutPage(){
  const { currentSchoolId } = useTenant();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [payments, setPayments] = useState([]);
  const [state, setState] = useState('idle');

  const canReopen = (user?.roles || []).includes(ROLES.ADMIN) || (user?.roles || []).includes(ROLES.SUPER_ADMIN);

  useEffect(() => {
    if (!currentSchoolId) return;
    (async ()=>{
      setState('loading');
      try {
        const to = new Date(); const from = new Date(); from.setHours(0,0,0,0);
        const { rows } = await listPayments({ from: from.toISOString(), to: to.toISOString(), limit: 200, sort: 'paid_at:desc' });
        setPayments(rows || []); setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);

  if (!currentSchoolId) return <MiniBanner/>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cashier Closeout</h1>
      <div className="text-sm text-gray-600">A lightweight closeout view for MVP. Session summaries and Z-Report exports will be added later.</div>

      {state === 'error' && <InlineError retry={() => window.location.reload()} />}

      <div className="border rounded p-3">
        <div className="text-sm text-gray-600 mb-2">Today’s Payments</div>
        <table className="w-full text-sm">
          <thead><tr><th className="text-left">ID</th><th className="text-left">Method</th><th className="text-left">Amount</th><th className="text-left">Paid At</th></tr></thead>
          <tbody>
            {payments.map(l => (
              <tr key={l.id}><td>{l.id}</td><td>{l.payment_method_id}</td><td>{formatMXN(l.amount)}</td><td>{l.paid_at ? new Date(l.paid_at).toLocaleString() : '-'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Something went wrong. <button className="underline" onClick={retry}>Retry</button></div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function formatMXN(n){
  try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; }
}


