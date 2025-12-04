import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { getPortalPayments } from '../../lib/api.portal';

export default function ParentPaymentsPage(){
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('idle');
  useEffect(() => {
    (async ()=>{
      setState('loading');
      try {
        const { rows } = await getPortalPayments({ limit: 100 });
        setRows(rows || []); setState('idle');
      } catch { setState('error'); }
    })();
  }, []);
  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.STUDENT_PARENT, 'student_parent']}>
        <div className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Payments</h1>
          {state === 'loading' ? (
            <div className="h-24 rounded border bg-gray-100 animate-pulse"/>
          ) : state === 'error' ? (
            <div className="text-sm text-red-700">Failed to load.</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-600">No payments.</div>
          ) : (
            <div className="rounded border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><Th>ID</Th><Th>Method</Th><Th>Amount</Th><Th>Paid At</Th></tr></thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.id || idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <Td>{r.id}</Td>
                      <Td>{labelForMethod(r.payment_method_id)}</Td>
                      <Td>{formatMXN(r.amount)}</Td>
                      <Td>{r.paid_at ? new Date(r.paid_at).toLocaleString() : '-'}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function Th({ children, className = '' }){ return <th className={`px-3 py-2 text-left font-medium text-gray-600 ${className}`}>{children}</th>; }
function Td({ children, className = '' }){ return <td className={`px-3 py-2 ${className}`}>{children}</td>; }
function formatMXN(n){ try { return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n||0)); } catch { return `$${Number(n||0).toFixed(2)}`; } }
function labelForMethod(id){ const map = { 1: 'Cash', 2: 'POS', 3: 'Transfer', 4: 'Online' }; return map[id] || `Method ${id}`; }


