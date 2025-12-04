import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listStudents, createStudent, updateStudent, deleteStudent } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { Table, THead, TR, TD } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal.jsx';

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
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', grade: '' });

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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Students</h1>
            <Button onClick={() => { setEditing(null); setForm({ first_name: '', last_name: '', grade: '' }); setShowModal(true); }}>Add Student</Button>
          </div>

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
            <Table head={<THead sticky columns={[{label:'Name'}, {label:'Level/Grade'}, {label:'Status'}, {label:'Actions'}]} />}>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>{`${r.first_name || ''} ${r.last_name || ''}`.trim()}</TD>
                  <TD>{r.grade || '-'}</TD>
                  <TD>{r.status || '-'}</TD>
                  <TD>
                    <button className="text-blue-600 underline text-sm mr-2" onClick={()=>{ setEditing(r); setForm({ first_name: r.first_name || '', last_name: r.last_name || '', grade: r.grade || '' }); setShowModal(true); }}>Edit</button>
                    <button className="text-red-600 underline text-sm" onClick={async()=>{ if (confirm('Delete student?')) { await deleteStudent(r.id); load(); } }}>Delete</button>
                  </TD>
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

          <StudentModal
            open={showModal}
            initial={editing}
            onClose={() => setShowModal(false)}
            onSaved={() => { setShowModal(false); load(); }}
          />
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

function StudentModal({ open, onClose, onSaved, initial }){
  const [first_name, setFirst] = useState(initial?.first_name || '');
  const [last_name, setLast] = useState(initial?.last_name || '');
  const [grade, setGrade] = useState(initial?.grade || '');
  const [saving, setSaving] = useState(false);
  async function onSubmit(e){
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { first_name, last_name, grade };
      if (initial?.id) await updateStudent(initial.id, payload); else await createStudent(payload);
      onSaved();
    } finally { setSaving(false); }
  }
  useEffect(()=>{ setFirst(initial?.first_name||''); setLast(initial?.last_name||''); setGrade(initial?.grade||''); }, [initial]);
  if (!open) return null;
  return (
    <Modal onClose={onClose} title={initial?.id ? 'Edit Student' : 'Add Student'}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">First Name</label>
          <input className="border rounded px-3 py-2 w-full" value={first_name} onChange={e=>setFirst(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Last Name</label>
          <input className="border rounded px-3 py-2 w-full" value={last_name} onChange={e=>setLast(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Grade</label>
          <input className="border rounded px-3 py-2 w-full" value={grade} onChange={e=>setGrade(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}

