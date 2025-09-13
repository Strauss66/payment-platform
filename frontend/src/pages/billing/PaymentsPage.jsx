import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listPayments } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { Table, THead, TR, TD } from '../../components/ui/Table';

function useDebounced(value, ms){
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function PaymentsPage(){
  const { currentSchoolId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const method = searchParams.get('method') || '';
  const cashierUserId = searchParams.get('cashierUserId') || '';
  const minAmount = searchParams.get('min') || '';
  const maxAmount = searchParams.get('max') || '';
  const limit = Number(searchParams.get('limit') || 10);
  const offset = Number(searchParams.get('offset') || 0);
  const q = searchParams.get('q') || '';

  const debouncedQ = useDebounced(q, 300);

  function update(k, v){
    const next = new URLSearchParams(searchParams);
    if (v === undefined || v === null || v === '') next.delete(k); else next.set(k, String(v));
    if (k !== 'offset') next.set('offset', '0');
    setSearchParams(next);
  }

  async function load(){
    if (!currentSchoolId) return;
    setState('loading');
    try {
      const { rows, count } = await listPayments({ from: from || undefined, to: to || undefined, method: method || undefined, cashierUserId: cashierUserId || undefined, min: minAmount || undefined, max: maxAmount || undefined, q: debouncedQ || undefined, limit, offset, sort: 'paid_at:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch (e) {
      setState('error');
    }
  }

  useEffect(() => { load(); }, [currentSchoolId, from, to, method, cashierUserId, minAmount, maxAmount, debouncedQ, limit, offset]);

  function exportCSV(){
    const header = ['Paid At','Student/Family','Method','Amount','Cashier','SessionId','Note'];
    const body = rows.map(r => [r.paid_at || r.received_at, r.student_id, r.method || r.payment_method_id, r.amount, r.cashier_user_id, r.session_id, r.note || '']);
    const lines = [header, ...body].map(cols => cols.map(c => JSON.stringify(c ?? '')).join(',')).join('\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Payments</h1>
            <Button onClick={exportCSV} disabled={rows.length===0}>Export CSV</Button>
          </div>

          {!currentSchoolId && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}

          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div>
              <label className="text-xs block mb-1">From</label>
              <input type="date" value={from} onChange={e=>update('from', e.target.value)} className="border rounded px-2 py-2" />
            </div>
            <div>
              <label className="text-xs block mb-1">To</label>
              <input type="date" value={to} onChange={e=>update('to', e.target.value)} className="border rounded px-2 py-2" />
            </div>
            <div>
              <label className="text-xs block mb-1">Method</label>
              <input placeholder="method id/name" value={method} onChange={e=>update('method', e.target.value)} className="border rounded px-2 py-2 w-40" />
            </div>
            <div>
              <label className="text-xs block mb-1">Cashier</label>
              <input placeholder="user id" value={cashierUserId} onChange={e=>update('cashierUserId', e.target.value)} className="border rounded px-2 py-2 w-32" />
            </div>
            <div>
              <label className="text-xs block mb-1">Amount min</label>
              <input type="number" value={minAmount} onChange={e=>update('min', e.target.value)} className="border rounded px-2 py-2 w-28" />
            </div>
            <div>
              <label className="text-xs block mb-1">Amount max</label>
              <input type="number" value={maxAmount} onChange={e=>update('max', e.target.value)} className="border rounded px-2 py-2 w-28" />
            </div>
            <div>
              <label className="text-xs block mb-1">Search</label>
              <input placeholder="Student/Family…" value={q} onChange={e=>update('q', e.target.value)} className="border rounded px-3 py-2 w-64" />
            </div>
            <div>
              <label className="text-xs block mb-1">Rows</label>
              <select value={limit} onChange={e=>update('limit', Number(e.target.value))} className="border rounded px-2 py-2">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {state === 'loading' ? (
            <TableSkeleton/>
          ) : state === 'error' ? (
            <InlineError retry={load} />
          ) : rows.length === 0 ? (
            <Empty/> 
          ) : (
            <Table head={<THead sticky columns={[{label:'Paid At'}, {label:'Student/Family'}, {label:'Method'}, {label:'Amount', right:true}, {label:'Cashier'}, {label:'SessionId'}, {label:'Note'}]} />}>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>{r.paid_at ? new Date(r.paid_at).toLocaleString() : (r.received_at ? new Date(r.received_at).toLocaleString() : '-')}</TD>
                  <TD>#{r.student_id}</TD>
                  <TD>{r.method || r.payment_method_id || '-'}</TD>
                  <TD right>${Number(r.amount ?? 0).toFixed(2)}</TD>
                  <TD>{r.cashier_user_id || '-'}</TD>
                  <TD>{r.session_id || '-'}</TD>
                  <TD>{r.note || '-'}</TD>
                </TR>
              ))}
            </Table>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => update('offset', Math.max(0, offset - limit))} disabled={offset===0}>Prev</Button>
              <Button variant="secondary" onClick={() => update('offset', offset + limit)} disabled={offset + limit >= total}>Next</Button>
            </div>
          </div>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function TableSkeleton(){
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3"/>
      <div className="h-8 bg-gray-200 rounded"/>
      <div className="h-8 bg-gray-200 rounded"/>
      <div className="h-8 bg-gray-200 rounded"/>
    </div>
  );
}

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
      Failed to load payments. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function Empty(){
  return (
    <div className="p-6 text-center text-gray-600">
      <div>No payments in this period.</div>
    </div>
  );
}


