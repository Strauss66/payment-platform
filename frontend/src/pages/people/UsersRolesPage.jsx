import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { listUsers, listRoles, assignRole, revokeRole } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { Table, THead, TR, TD } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

export default function UsersRolesPage(){
  const { user } = useAuth();
  const [state, setState] = useState('idle');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const canEdit = (user?.roles || []).includes(ROLES.SUPER_ADMIN);

  async function load(){
    setState('loading');
    try {
      const [u, r] = await Promise.all([listUsers({ limit: 100 }), listRoles()]);
      setUsers(u.rows || []); setRoles(r.rows || r || []); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, []);

  function openAssign(u){ setSelectedUser(u); setOpen(true); }

  async function onToggleRole(role){
    if (!selectedUser) return;
    const has = (selectedUser.roles || []).includes(role);
    setState('saving');
    try {
      if (has) await revokeRole(selectedUser.id, role); else await assignRole(selectedUser.id, role);
      await load(); setOpen(false); setSelectedUser(null);
    } catch { setState('idle'); }
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Users & Roles</h1>
          </div>
          {state === 'loading' ? (
            <div>Loading…</div>
          ) : state === 'error' ? (
            <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load users/roles.</div>
          ) : (
            <Table head={<THead sticky columns={[{label:'User'}, {label:'Roles'}, {label:'Last Login'}, {label:''}]} />}>
              {(users || []).map(u => (
                <TR key={u.id}>
                  <TD>{u.name || u.email}</TD>
                  <TD>{(u.roles || []).map(r => (<span key={r} className="inline-block text-xs px-2 py-0.5 bg-gray-200 rounded mr-1">{r}</span>))}</TD>
                  <TD>{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : '-'}</TD>
                  <TD>{canEdit ? <button className="text-blue-600 underline text-sm" onClick={()=>openAssign(u)}>Assign</button> : <span className="text-gray-500 text-sm">Read-only</span>}</TD>
                </TR>
              ))}
            </Table>
          )}

          <Modal open={open} onClose={() => setOpen(false)} title={`Assign roles: ${selectedUser?.name || selectedUser?.email || ''}`}>
            <div className="space-y-2">
              {(roles.rows || roles || []).map((r) => {
                const role = r.name || r;
                const has = (selectedUser?.roles || []).includes(role);
                return (
                  <div key={role} className="flex items-center justify-between p-2 border rounded">
                    <div>{role}</div>
                    <Button onClick={() => onToggleRole(role)} disabled={!canEdit} variant={has? 'secondary':'primary'}>{has? 'Revoke':'Assign'}</Button>
                  </div>
                );
              })}
            </div>
          </Modal>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


