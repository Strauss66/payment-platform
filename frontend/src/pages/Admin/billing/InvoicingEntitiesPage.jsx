import React, { useEffect, useMemo, useState } from 'react';
import { listInvoicingEntities, createInvoicingEntity, updateInvoicingEntity, deleteInvoicingEntity } from '../../../lib/api.billing';
import { useTenant } from '../../../contexts/TenantContext';
import ProtectedRoute from '../../../app/guards/ProtectedRoute';
import RoleGate from '../../../app/guards/RoleGate';
import { ROLES } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import EmptyState from '../../../components/ui/EmptyState';
import { Table, THead, TR, TD } from '../../../components/ui/Table';
import InvoicingEntityForm from '../../../components/admin/billing/InvoicingEntityForm';

export default function InvoicingEntitiesPage() {
  const { currentSchoolId, needsSelection } = useTenant();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('idle');
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(() => Number(localStorage.getItem('billing.pageSize') || 10));
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem('billing.pageSize', String(pageSize)); }, [pageSize]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(r => !q || r.name?.toLowerCase().includes(q) || r.tax_id?.toLowerCase().includes(q));
  }, [rows, query]);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  async function load() {
    if (!currentSchoolId) return;
    setState('loading');
    try {
      const { rows } = await listInvoicingEntities();
      setRows(rows);
      setState('idle');
    } catch (e) {
      setState('error');
    }
  }

  useEffect(() => { if (currentSchoolId) load(); }, [currentSchoolId]);

  const onCreate = () => { setSelected(null); setOpen(true); };
  const onEdit = (row) => { setSelected(row); setOpen(true); };
  const onDelete = async (row) => {
    if (!window.confirm('Delete this invoicing entity?')) return;
    setState('deleting');
    try {
      await deleteInvoicingEntity(row.id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed');
    } finally {
      setState('idle');
    }
  };

  const handleSubmit = async (payload) => {
    setState('saving');
    try {
      if (selected?.id) await updateInvoicingEntity(selected.id, payload);
      else await createInvoicingEntity(payload);
      setOpen(false); setSelected(null);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || 'Save failed');
    } finally {
      setState('idle');
    }
  };

  const disabled = !currentSchoolId || needsSelection;

  return (
    <ProtectedRoute>
      <RoleGate roles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Invoice Emitters</h1>
            <Button onClick={onCreate} disabled={disabled}>+ New</Button>
          </div>
          {disabled && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>
          )}
          <div className="flex items-center gap-3 mb-3">
            <input placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} className="border rounded px-3 py-2 w-64" />
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="border rounded px-2 py-2">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          {state === 'loading' ? (
            <div>Loading…</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No emitters" description="Create your first invoicing entity." />
          ) : (
            <Table head={<THead columns={[
              { label: 'Name' },
              { label: 'Tax ID' },
              { label: 'Tax System' },
              { label: 'Email' },
              { label: 'Phone' },
              { label: 'Default' },
              { label: 'Actions', right: true }
            ]} />}>
              {paged.map(r => (
                <TR key={r.id}>
                  <TD>{r.name}</TD>
                  <TD>{r.tax_id || '-'}</TD>
                  <TD>{r.tax_system_code || '-'}</TD>
                  <TD>{r.email || '-'}</TD>
                  <TD>{r.phone || '-'}</TD>
                  <TD>{Number(r.is_default) === 1 ? 'Yes' : 'No'}</TD>
                  <TD right>
                    <button className="text-blue-600 mr-3" onClick={() => onEdit(r)}>Edit</button>
                    <button className="text-red-600" onClick={() => onDelete(r)} disabled={state==='deleting'}>Delete</button>
                  </TD>
                </TR>
              ))}
            </Table>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>Showing {(page-1)*pageSize + 1} - {Math.min(page*pageSize, filtered.length)} of {filtered.length}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Prev</Button>
              <Button variant="secondary" onClick={() => setPage(p => (p*pageSize<filtered.length? p+1 : p))} disabled={page*pageSize>=filtered.length}>Next</Button>
            </div>
          </div>

          <Modal open={open} onClose={() => setOpen(false)} title={selected? 'Edit Invoicing Entity' : 'New Invoicing Entity'}>
            <InvoicingEntityForm initialValue={selected} onSubmit={handleSubmit} onCancel={() => setOpen(false)} submitting={state==='saving'} />
          </Modal>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


