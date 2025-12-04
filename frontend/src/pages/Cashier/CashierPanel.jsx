import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import Button from '../../components/ui/Button';
import { api } from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';
import { listPayments } from '../../lib/api.billing';

export default function CashierPanel(){
  const { currentSchoolId, needsSelection } = useTenant();
  const { show } = useToast();
  const [registers, setRegisters] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState('');
  const [todayPayments, setTodayPayments] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);

  async function load(){
    if (!currentSchoolId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/billing/cash-registers');
      setRegisters(data);
      // Try to find my open session
      // No direct endpoint; rely on payments POST error if missing. Keep null until opened.
    } finally { setLoading(false); }
  }

  useEffect(() => { if (currentSchoolId) load(); }, [currentSchoolId]);

  useEffect(() => {
    if (!currentSchoolId) return;
    (async ()=>{
      try {
        const to = new Date(); const from = new Date(); from.setHours(0,0,0,0);
        const { rows } = await listPayments({ from: from.toISOString(), to: to.toISOString(), limit: 50, sort: 'paid_at:desc' });
        setTodayPayments(rows || []);
        const total = (rows || []).reduce((s, r) => s + Number(r.amount || 0), 0);
        setTodayTotal(total);
      } catch {}
    })();
  }, [currentSchoolId, session]);

  const openSession = async (registerId) => {
    try {
      const { data } = await api.post(`/api/billing/cash-registers/${registerId}/sessions/open`);
      setSession(data);
      show('Session opened');
    } catch (e) {
      show(e?.response?.data?.message || 'Failed to open session', 'error');
    }
  };

  const closeSession = async () => {
    if (!session) return;
    try {
      const { data } = await api.post(`/api/billing/cash-registers/${session.cash_register_id}/sessions/${session.id}/close`);
      setSession(null);
      show('Session closed');
    } catch (e) {
      show(e?.response?.data?.message || 'Failed to close session', 'error');
    }
  };

  const takePayment = async () => {
    try {
      const payload = {
        student_id: Number(studentId),
        payment_method_id: methodId ? Number(methodId) : undefined,
        amount: Number(amount),
        session_id: session?.id || undefined,
        allocations: []
      };
      const { data } = await api.post('/api/billing/payments', payload);
      show('Payment recorded');
      setAmount('');
      setStudentId('');
    } catch (e) {
      show(e?.response?.data?.message || 'Payment failed', 'error');
    }
  };

  const disabled = !currentSchoolId || needsSelection;

  return (
    <ProtectedRoute>
      <RoleGate roles={[ROLES.ADMIN, ROLES.CASHIER]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Cashier Panel</h1>
          </div>
          {disabled && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}
          {!disabled && (
            <div className="space-y-6">
              <section>
                <h2 className="font-medium mb-2">Session</h2>
                {session ? (
                  <div className="flex items-center gap-3">
                    <div>Open on register #{session.cash_register_id}</div>
                    <Button variant="secondary" onClick={closeSession}>Close Session</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <select className="border rounded px-2 py-2" onChange={(e)=>setSession(null)} defaultValue="">
                      <option value="" disabled>Choose register</option>
                      {registers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <Button onClick={() => {
                      const sel = document.querySelector('select').value;
                      if (sel) openSession(Number(sel));
                    }}>Open Session</Button>
                  </div>
                )}
              </section>

              <section>
                <h2 className="font-medium mb-2">Take Payment</h2>
                <div className="grid grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-sm">Student ID</label>
                    <input className="border rounded px-3 py-2 w-full" value={studentId} onChange={(e)=>setStudentId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">Amount</label>
                    <input className="border rounded px-3 py-2 w-full" value={amount} onChange={(e)=>setAmount(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm">Method ID</label>
                    <input className="border rounded px-3 py-2 w-full" value={methodId} onChange={(e)=>setMethodId(e.target.value)} />
                  </div>
                  <div>
                    <Button onClick={takePayment} disabled={!amount || !studentId}>Submit</Button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">Note: requires an open session. If none, you will be prompted.</div>
              </section>

              <section>
                <h2 className="font-medium mb-2">Today’s Payments</h2>
                <div className="rounded border bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-3 py-2">ID</th>
                        <th className="text-left px-3 py-2">Method</th>
                        <th className="text-left px-3 py-2">Amount</th>
                        <th className="text-left px-3 py-2">Paid At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayPayments.map((p, idx) => (
                        <tr key={p.id || idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                          <td className="px-3 py-2">{p.id}</td>
                          <td className="px-3 py-2">{p.payment_method_id}</td>
                          <td className="px-3 py-2">{formatMXN(p.amount)}</td>
                          <td className="px-3 py-2">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-3 py-2 flex justify-end text-sm text-gray-700">
                    <div className="font-medium">Total Today: {formatMXN(todayTotal)}</div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function formatMXN(n){
  try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; }
}


