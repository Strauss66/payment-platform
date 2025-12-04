import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { getMyStudents, getPortalStatement } from '../../lib/api.portal';

export default function ParentInvoicesPage(){
  const [studentId, setStudentId] = useState('');
  const [students, setStudents] = useState([]);
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('idle');

  useEffect(() => { (async ()=>{ setStudents(await getMyStudents()); })(); }, []);
  useEffect(() => {
    if (!studentId) return;
    (async ()=>{
      setState('loading');
      try {
        const { invoices } = await getPortalStatement(studentId);
        setRows(Array.isArray(invoices) ? invoices : []); setState('idle');
      } catch { setState('error'); }
    })();
  }, [studentId]);

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.STUDENT_PARENT, 'student_parent']}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Invoices</h1>
            <select className="border rounded px-2 py-1" value={studentId} onChange={(e)=>setStudentId(e.target.value)}>
              <option value="">Select student…</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
            </select>
          </div>
          {state === 'loading' ? (
            <div className="h-24 rounded border bg-gray-100 animate-pulse"/>
          ) : state === 'error' ? (
            <div className="text-sm text-red-700">Failed to load.</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-600">No invoices.</div>
          ) : (
            <div className="rounded border bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr><Th>Date</Th><Th>Due</Th><Th>Status</Th><Th className="text-right">Amount</Th><Th className="text-right">Balance</Th></tr></thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={r.id || idx} className={idx % 2 === 1 ? 'bg-gray-50/50' : ''}>
                      <Td>{r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}</Td>
                      <Td>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</Td>
                      <Td>{String(r.status || '').toUpperCase()}</Td>
                      <Td className="text-right">{formatMXN(r.total)}</Td>
                      <Td className="text-right">{formatMXN(r.balance)}</Td>
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


