import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listFamilies, createFamily, updateFamily, deleteFamily } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { Table, THead, TR, TD } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal.jsx';

function useDebounced(value, ms){
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function FamiliesPage(){
  const { currentSchoolId } = useTenant();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', surname: '' });

  const q = searchParams.get('q') || '';
  const levelId = searchParams.get('levelId') || '';
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
      const { rows, count } = await listFamilies({ q: debouncedQ || undefined, levelId: levelId || undefined, limit, offset, sort: 'id:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, [currentSchoolId, debouncedQ, levelId, limit, offset]);

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Families</h1>
            <Button onClick={() => { setEditing(null); setForm({ code: '', surname: '' }); setShowModal(true); }}>Add Family</Button>
          </div>

          {!currentSchoolId && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}

          <div className="flex flex-wrap items-end gap-3 mb-3">
            <div>
              <label className="text-xs block mb-1">Search</label>
              <input placeholder="Surname…" value={q} onChange={e=>update('q', e.target.value)} className="border rounded px-3 py-2 w-64" />
            </div>
            <div>
              <label className="text-xs block mb-1">Level</label>
              <input placeholder="level id" value={levelId} onChange={e=>update('levelId', e.target.value)} className="border rounded px-2 py-2 w-32" />
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
            <Table head={<THead sticky columns={[{label:'Code'}, {label:'Surname'}, {label:'Actions'}]} />}>
              {rows.map((r) => (
                <TR key={r.id}>
                  <TD>{r.code}</TD>
                  <TD>{r.surname}</TD>
                  <TD>
                    <button className="text-blue-600 underline text-sm mr-2" onClick={()=>{ setEditing(r); setForm({ code: r.code || '', surname: r.surname || '' }); setShowModal(true); }}>Edit</button>
                    <button className="text-red-600 underline text-sm" onClick={async()=>{ if (confirm('Delete family?')) { await deleteFamily(r.id); load(); } }}>Delete</button>
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

          <FamilyModal
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
      Failed to load families. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function Empty(){
  return (
    <div className="p-6 text-center text-gray-600">
      <div>No families found.</div>
    </div>
  );
}

function FamilyModal({ open, onClose, onSaved, initial }){
  const [code, setCode] = useState(initial?.code || '');
  const [surname, setSurname] = useState(initial?.surname || '');
  const [saving, setSaving] = useState(false);
  async function onSubmit(e){
    e.preventDefault();
    setSaving(true);
    try {
      if (initial?.id) await updateFamily(initial.id, { code, surname }); else await createFamily({ code, surname });
      onSaved();
    } finally { setSaving(false); }
  }
  useEffect(()=>{ setCode(initial?.code || ''); setSurname(initial?.surname || ''); }, [initial]);
  if (!open) return null;
  return (
    <Modal onClose={onClose} title={initial?.id ? 'Edit Family' : 'Add Family'}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Code</label>
          <input className="border rounded px-3 py-2 w-full" value={code} onChange={e=>setCode(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Surname</label>
          <input className="border rounded px-3 py-2 w-full" value={surname} onChange={e=>setSurname(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
}

