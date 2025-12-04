import React, { useEffect, useState } from 'react';
import { useTenant } from '../../../contexts/TenantContext';
import { getAttentionNeeded } from '../../../lib/api.metrics';

export default function AttentionNeeded(){
  const { currentSchoolId } = useTenant();
  const [rows, setRows] = useState(null);
  const [state, setState] = useState('idle');
  useEffect(() => {
    if (!currentSchoolId) return;
    const controller = new AbortController();
    (async ()=>{
      setState('loading');
      try {
        const data = await getAttentionNeeded({ limit: 10, signal: controller.signal });
        setRows(Array.isArray(data) ? data : []); setState('idle');
      } catch (e) { if (!controller.signal.aborted) setState('error'); }
    })();
    return () => controller.abort();
  }, [currentSchoolId]);
  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <div className="h-24 rounded border bg-gray-100 animate-pulse"/>;
  if (state === 'error') return <div className="text-sm text-red-700">Failed to load.</div>;
  if (!rows || rows.length === 0) return <div className="text-sm text-gray-600">Nothing needs attention right now.</div>;
  return (
    <div className="rounded-2xl border bg-white">
      <div className="px-4 py-3 text-sm text-gray-600 border-b">Overdue Invoices</div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th>Invoice #</Th>
            <Th>Student</Th>
            <Th>Due</Th>
            <Th className="text-right">Balance</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id || idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
              <Td>{r.invoice_no || r.id}</Td>
              <Td>{r.student_name || '-'}</Td>
              <Td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</Td>
              <Td className="text-right">{formatMXN(r.balance)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }){ return <th className={`px-4 py-2 text-left font-medium text-gray-600 ${className}`}>{children}</th>; }
function Td({ children, className = '' }){ return <td className={`px-4 py-2 ${className}`}>{children}</td>; }
function MiniBanner(){ return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>; }
function formatMXN(n){ try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; } }


