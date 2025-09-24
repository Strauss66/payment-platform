import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listInvoices, NoTenantError } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge.jsx';
import CFDIPreviewModal from '../../components/billing/CFDIPreviewModal.jsx';
import CFDICancelModal from '../../components/billing/CFDICancelModal.jsx';
import { downloadInvoiceCFDIXml, downloadInvoiceCFDIPdf } from '../../lib/api.billing.js';
import { saveBlob } from '../../lib/file.js';
import { Table, THead, TR, TD } from '../../components/ui/Table';

function useDebounced(value, ms){
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function InvoicesPage(){
  const { currentSchoolId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [previewId, setPreviewId] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const status = searchParams.get('status') || 'open';
  const q = searchParams.get('q') || '';
  const dueFrom = searchParams.get('dueFrom') || '';
  const dueTo = searchParams.get('dueTo') || '';
  const limit = Number(searchParams.get('limit') || 10);
  const offset = Number(searchParams.get('offset') || 0);

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
      const { rows, count } = await listInvoices({ status, dueFrom: dueFrom || undefined, dueTo: dueTo || undefined, q: debouncedQ || undefined, limit, offset, sort: 'due_date:asc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch (e) {
      if (e?.name === 'NoTenantError') { setState('idle'); return; }
      setState('error');
    }
  }

  useEffect(() => { load(); }, [currentSchoolId, status, debouncedQ, dueFrom, dueTo, limit, offset]);

  function exportCSV(){
    const header = ['Student/Family','Concept','Due Date','Subtotal','Paid','Balance','Status'];
    const body = rows.map(r => [r.student_id, r.concept || '-', r.due_date, r.subtotal ?? r.total ?? 0, r.paid ?? 0, r.balance ?? 0, r.status]);
    const lines = [header, ...body].map(cols => cols.map(c => JSON.stringify(c ?? '')).join(',')).join('\n');
    const blob = new Blob([lines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Invoices</h1>
            <Button onClick={exportCSV} disabled={rows.length===0}>Export CSV</Button>
          </div>

          {!currentSchoolId && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}

          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div>
              <label className="text-xs block mb-1">Status</label>
              <select value={status} onChange={e=>update('status', e.target.value)} className="border rounded px-2 py-2">
                <option value="open">Open</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1">Due from</label>
              <input type="date" value={dueFrom} onChange={e=>update('dueFrom', e.target.value)} className="border rounded px-2 py-2" />
            </div>
            <div>
              <label className="text-xs block mb-1">Due to</label>
              <input type="date" value={dueTo} onChange={e=>update('dueTo', e.target.value)} className="border rounded px-2 py-2" />
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
            <Table head={<THead sticky columns={[{label:'Student/Family'}, {label:'Concept'}, {label:'Due Date'}, {label:'Subtotal', right:true}, {label:'Paid', right:true}, {label:'Balance', right:true}, {label:'CFDI Status'}, {label:'Actions'}]} />}>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>#{r.student_id}</TD>
                  <TD>{r.concept || '-'}</TD>
                  <TD>{r.due_date ? new Date(r.due_date).toLocaleDateString() : '-'}</TD>
                  <TD right>${Number(r.subtotal ?? r.total ?? 0).toFixed(2)}</TD>
                  <TD right>${Number(r.paid ?? 0).toFixed(2)}</TD>
                  <TD right>${Number(r.balance ?? 0).toFixed(2)}</TD>
                  <TD>{renderCfdiChip(r)}</TD>
                  <TD>{renderActions(r)}</TD>
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
function renderCfdiChip(r){
  const s = r.cfdi_status || 'none';
  if (s === 'stamped') return <Badge color="green">Stamped</Badge>;
  if (s === 'canceled') return <Badge color="red">Canceled</Badge>;
  if (s === 'draft') return <Badge color="indigo">Draft</Badge>;
  return <Badge color="gray">None</Badge>;
}

function InvoicesPageActions({ row, onPreview, onCancel, refresh }){
  async function download(kind){
    if (kind === 'xml') { const blob = await downloadInvoiceCFDIXml(row.id); saveBlob(blob, `FAC-${row.id}.xml`); }
    if (kind === 'pdf') { const blob = await downloadInvoiceCFDIPdf(row.id); saveBlob(blob, `FAC-${row.id}.pdf`); }
  }
  return (
    <div className="flex gap-2 text-sm">
      <button className="text-blue-600 underline" onClick={()=>onPreview(row.id)}>Preview</button>
      {row.cfdi_status !== 'stamped' && <button className="text-green-600 underline" onClick={()=>onPreview(row.id)}>Stamp</button>}
      {row.cfdi_status === 'stamped' && <button className="text-indigo-600 underline" onClick={()=>download('xml')}>XML</button>}
      {row.cfdi_status === 'stamped' && <button className="text-indigo-600 underline" onClick={()=>download('pdf')}>PDF</button>}
      {row.cfdi_status === 'stamped' && <button className="text-red-600 underline" onClick={()=>onCancel(row.id)}>Cancel</button>}
    </div>
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
      Failed to load invoices. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function Empty(){
  return (
    <div className="p-6 text-center text-gray-600">
      <div>No invoices match your filters.</div>
    </div>
  );
}


