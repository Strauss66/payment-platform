import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listStudents } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { Table, THead, TR, TD } from '../../components/ui/Table';

function useDebounced(value, ms){
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function StudentsPage(){
  const { currentSchoolId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const q = searchParams.get('q') || '';
  const levelId = searchParams.get('levelId') || '';
  const status = searchParams.get('status') || '';
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
      const { rows, count } = await listStudents({ q: debouncedQ || undefined, levelId: levelId || undefined, status: status || undefined, limit, offset, sort: 'id:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, [currentSchoolId, debouncedQ, levelId, status, limit, offset]);

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <h1 className="text-xl font-semibold mb-4">Students</h1>

          {!currentSchoolId && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}

          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div>
              <label className="text-xs block mb-1">Search</label>
              <input placeholder="Name or enrollment…" value={q} onChange={e=>update('q', e.target.value)} className="border rounded px-3 py-2 w-64" />
            </div>
            <div>
              <label className="text-xs block mb-1">Level</label>
              <input placeholder="level id" value={levelId} onChange={e=>update('levelId', e.target.value)} className="border rounded px-2 py-2 w-32" />
            </div>
            <div>
              <label className="text-xs block mb-1">Status</label>
              <select value={status} onChange={e=>update('status', e.target.value)} className="border rounded px-2 py-2">
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
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
            <InlineError retry={load}/>
          ) : rows.length === 0 ? (
            <Empty/>
          ) : (
            <Table head={<THead sticky columns={[{label:'Name'}, {label:'Family'}, {label:'Level/Grade'}, {label:'Enrollment #'}, {label:'Status'}, {label:'Balance', right:true}, {label:'Actions'}]} />}>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>{r.name || `${r.first_name || ''} ${r.last_name || ''}`}</TD>
                  <TD>#{r.family_id || '-'}</TD>
                  <TD>{r.level || r.grade || '-'}</TD>
                  <TD>{r.enrollment_no || '-'}</TD>
                  <TD>{r.status || '-'}</TD>
                  <TD right>${Number(r.balance ?? 0).toFixed(2)}</TD>
                  <TD><button className="text-blue-600 underline text-sm">Open</button></TD>
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
      Failed to load students. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function Empty(){
  return (
    <div className="p-6 text-center text-gray-600">
      <div>No students found.</div>
    </div>
  );
}


