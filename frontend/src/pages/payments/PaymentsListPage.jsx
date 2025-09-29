import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { listPayments } from '../../lib/api.billing';
import Toolbar from '../../components/ui/Toolbar.tsx';
import SearchInput from '../../components/ui/SearchInput.tsx';
import Dropdown from '../../components/ui/Dropdown.tsx';
import DataTable from '../../components/ui/DataTable.tsx';
import Pill from '../../components/ui/Pill.tsx';
import IconLabel from '../../components/ui/IconLabel.tsx';
import { getMethodIcon, statusToTone } from '../../constants/payments.ts';

const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

function useDebounced(value, ms){
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function PaymentsListPage(){
  const { currentSchoolId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [state, setState] = useState('idle');

  const status = searchParams.get('status') || '';
  const method = searchParams.get('method') || '';
  const range = searchParams.get('range') || '';
  const q = searchParams.get('q') || '';
  const limit = Number(searchParams.get('limit') || 10);
  const offset = Number(searchParams.get('offset') || 0);

  const debouncedQ = useDebounced(q, 300);

  function setParam(k, v){
    const next = new URLSearchParams(searchParams);
    if (!v) next.delete(k); else next.set(k, String(v));
    if (k !== 'offset') next.set('offset', '0');
    setSearchParams(next);
  }

  useEffect(() => {
    if (!currentSchoolId) return;
    (async()=>{
      setState('loading');
      try {
        const { rows, count } = await listPayments({ status: status || undefined, method: method || undefined, range: range || undefined, q: debouncedQ || undefined, limit, offset, sort: { field: 'paid_at', dir: 'desc' } });
        setRows(rows || []); setCount(count ?? (rows||[]).length); setState('idle');
      } catch {
        setState('error');
      }
    })();
  }, [currentSchoolId, status, method, range, debouncedQ, limit, offset]);

  const columns = useMemo(() => [
    { key: 'invoice', header: 'Invoice #', render: (r) => r.invoice_no || r.invoice_id || r.id },
    { key: 'student', header: 'Student/Family', render: (r) => r.student_name || `#${r.student_id}` },
    { key: 'due', header: 'Due Date', render: (r) => r.due_date ? new Date(r.due_date).toLocaleDateString() : '-' },
    { key: 'status', header: 'Status', render: (r) => <Pill tone={statusToTone(r.status)}>{String(r.status||'').replace(/^\w/, c=>c.toUpperCase())}</Pill> },
    { key: 'amount', header: 'Amount', render: (r) => mxn.format(Number(r.amount ?? r.total ?? 0)), className: 'text-right' },
    { key: 'method', header: 'Method', render: (r) => { const Icon = getMethodIcon(r.method||r.payment_method)||null; return <IconLabel icon={Icon ? <Icon className="h-4 w-4"/> : null} label={String(r.method||r.payment_method||'-')} />; } },
    { key: 'cashier', header: 'Cashier', render: (r) => r.cashier_name || r.cashier_user_id || '-' },
    { key: 'notes', header: 'Notes', render: (r) => r.note ? '•' : '' },
  ], []);

  function onRowClick(r){
    const id = r.invoice_id || r.id;
    if (!id) return;
    navigate(`/app/billing/payments?focus=${encodeURIComponent(id)}`);
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.CASHIER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-slate-900">Payments</div>
            <div className="text-sm text-slate-600">View and manage all payments</div>
          </div>

          <Toolbar
            left={
              <>
                <Dropdown label="Status" options={[{value:'',label:'All'},{value:'paid',label:'Paid'},{value:'pending',label:'Pending'},{value:'overdue',label:'Overdue'}]} value={status} onChange={(v)=>setParam('status', v)} />
                <Dropdown label="Date Range" options={[{value:'',label:'Any'},{value:'30d',label:'Last 30 days'},{value:'90d',label:'Last 90 days'}]} value={range} onChange={(v)=>setParam('range', v)} />
                <Dropdown label="Method" options={[{value:'',label:'All'},{value:'cash',label:'Cash'},{value:'pos',label:'POS'},{value:'transfer',label:'Transfer'},{value:'online',label:'Online'}]} value={method} onChange={(v)=>setParam('method', v)} />
                <button className="text-sm text-slate-600 underline" onClick={()=>{ ['status','range','method','q','offset'].forEach(k=>searchParams.delete(k)); setSearchParams(searchParams); }}>Clear Filters</button>
              </>
            }
            right={
              <>
                <Dropdown label="Columns" options={[{value:'default',label:'Default'}]} />
                <button className="px-3 py-2 rounded-lg border bg-white text-sm">Export</button>
              </>
            }
          />

          <SearchInput value={q} onChange={(v)=>setParam('q', v)} placeholder="Search invoices, students…" />

          {state === 'loading' ? (
            <div className="h-24 rounded-2xl border bg-white animate-pulse" />
          ) : state === 'error' ? (
            <div className="p-3 rounded border border-rose-200 bg-rose-50 text-rose-700 text-sm">Failed to load.</div>
          ) : (
            <DataTable columns={columns} rows={rows} onRowClick={onRowClick} emptyText="No payments" />
          )}

          <div className="flex items-center justify-between text-sm">
            <div>Showing {offset + 1} - {Math.min(offset + limit, count)} of {count}</div>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded border" onClick={()=>setParam('offset', Math.max(0, offset - limit))} disabled={offset===0}>Prev</button>
              <button className="px-2 py-1 rounded border" onClick={()=>setParam('offset', offset + limit)} disabled={offset + limit >= count}>Next</button>
            </div>
          </div>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


