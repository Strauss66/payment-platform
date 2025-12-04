import React, { useState } from 'react';
import { api } from '../../../../lib/apiClient';

export default function CashierSessionStatus(){
  const [sessionId, setSessionId] = useState('');
  async function xReport(){
    if (!sessionId) return;
    try {
      await api.get(`/api/billing/cash-sessions/${sessionId}/summary`);
      alert('X Report ready. Visit Cashier Closeout page for details.');
    } catch {}
  }
  async function zReport(){
    if (!sessionId) return;
    window.open(`/api/billing/cash-sessions/${sessionId}/z-report`, '_blank');
  }
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-sm text-gray-600">Cash Session</div>
      <div className="mt-2 flex items-center gap-2">
        <input className="border rounded px-2 py-1" placeholder="Session ID" value={sessionId} onChange={e=>setSessionId(e.target.value)} />
        <button className="px-2 py-1 border rounded" onClick={xReport}>X Report</button>
        <button className="px-2 py-1 border rounded" onClick={zReport}>Z Report (PDF)</button>
      </div>
    </div>
  );
}


