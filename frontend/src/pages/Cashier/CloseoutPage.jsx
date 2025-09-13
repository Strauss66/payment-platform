import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../lib/apiClient';
import { useTenant } from '../../contexts/TenantContext';
import { ROLES, useAuth } from '../../contexts/AuthContext';

export default function CloseoutPage(){
  const { currentSchoolId } = useTenant();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [lines, setLines] = useState({ rows: [], count: 0 });
  const [counted, setCounted] = useState('');
  const [state, setState] = useState('idle');

  const canReopen = (user?.roles || []).includes(ROLES.ADMIN) || (user?.roles || []).includes(ROLES.SUPER_ADMIN);

  async function loadSummary() {
    if (!currentSchoolId || !sessionId) return;
    setState('loading');
    try {
      const { data } = await api.get(`/api/billing/cash-sessions/${sessionId}/summary`);
      setSummary(data); setState('idle');
    } catch { setState('error'); }
  }

  async function loadLines() {
    if (!currentSchoolId || !sessionId) return;
    setState('loading');
    try {
      const { data } = await api.get(`/api/billing/cash-sessions/${sessionId}/lines`, { params: { limit: 200 } });
      setLines(data); setState('idle');
    } catch { setState('error'); }
  }

  async function closeSession(){
    if (!sessionId || !counted) return;
    setState('loading');
    try {
      await api.post(`/api/billing/cash-sessions/${sessionId}/close`, { countedCash: Number(counted) });
      await loadSummary();
      setState('idle');
    } catch { setState('error'); }
  }

  async function reopenSession(){
    if (!sessionId) return;
    setState('loading');
    try {
      await api.post(`/api/billing/cash-sessions/${sessionId}/reopen`, { memo: 'Reopen for adjustment' });
      await loadSummary();
      setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => {
    if (tab === 'summary') loadSummary();
    else if (tab === 'lines') loadLines();
  }, [tab, sessionId]);

  if (!currentSchoolId) return <MiniBanner/>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cashier Closeout</h1>
      <div className="flex items-center gap-2">
        <input className="border rounded px-2 py-1" placeholder="Session ID" value={sessionId} onChange={e=>setSessionId(e.target.value)} />
        <button className={`px-3 py-1 border rounded ${tab==='summary'?'bg-gray-100':''}`} onClick={()=>setTab('summary')}>Summary</button>
        <button className={`px-3 py-1 border rounded ${tab==='lines'?'bg-gray-100':''}`} onClick={()=>setTab('lines')}>Lines</button>
        <button className={`px-3 py-1 border rounded ${tab==='pdf'?'bg-gray-100':''}`} onClick={()=>setTab('pdf')}>PDF Export</button>
      </div>

      {state === 'error' && <InlineError retry={() => setState('idle')} />}

      {tab === 'summary' && summary && (
        <div className="space-y-3">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Totals by Method</div>
            <ul className="text-sm mt-2">
              {summary.methods.map(m => (
                <li key={m.payment_method_id} className="flex justify-between"><span>Method {m.payment_method_id}</span><span>${m.total.toFixed(2)}</span></li>
              ))}
            </ul>
          </div>
          <div className="border rounded p-3 space-y-2">
            <div className="flex justify-between"><span>Expected Cash</span><span>${summary.expectedCash.toFixed(2)}</span></div>
            <div className="flex items-center gap-2">
              <label className="text-sm">Counted Cash</label>
              <input className="border rounded px-2 py-1" type="number" value={counted} onChange={e=>setCounted(e.target.value)} />
              <button className="px-3 py-1 border rounded bg-blue-600 text-white" disabled={!counted} onClick={closeSession}>Close Session</button>
              {canReopen && <button className="px-3 py-1 border rounded" onClick={reopenSession}>Reopen</button>}
            </div>
            <div className="flex justify-between"><span>Variance</span><span>${summary.variance.toFixed(2)}</span></div>
          </div>
        </div>
      )}

      {tab === 'lines' && (
        <div className="border rounded p-3">
          <div className="text-sm text-gray-600 mb-2">Lines</div>
          <table className="w-full text-sm">
            <thead><tr><th className="text-left">ID</th><th className="text-left">Method</th><th className="text-left">Amount</th><th className="text-left">Paid At</th></tr></thead>
            <tbody>
              {lines.rows.map(l => (
                <tr key={l.id}><td>{l.id}</td><td>{l.payment_method_id}</td><td>${Number(l.amount).toFixed(2)}</td><td>{new Date(l.paid_at).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pdf' && (
        <div className="border rounded p-3 space-y-2">
          <div className="text-sm text-gray-600">Z Report</div>
          <button className="px-3 py-1 border rounded" disabled={!sessionId} onClick={() => window.open(`/api/billing/cash-sessions/${sessionId}/z-report`, '_blank')}>Download Z Report (PDF)</button>
        </div>
      )}
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


