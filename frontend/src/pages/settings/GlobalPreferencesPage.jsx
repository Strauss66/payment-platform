import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES, useAuth } from '../../contexts/AuthContext';
import { listGlobalPrefs, updateGlobalPrefs } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function GlobalPreferencesPage(){
  const { user } = useAuth();
  const canEdit = (user?.roles || []).includes(ROLES.SUPER_ADMIN);
  const { show } = useToast();
  const [state, setState] = useState('idle');
  const [form, setForm] = useState({});
  const [initial, setInitial] = useState({});

  async function load(){
    setState('loading');
    try { const data = await listGlobalPrefs(); setForm(data); setInitial(data); setState('idle'); }
    catch { setState('error'); }
  }
  useEffect(() => { load(); }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  async function onSave(){
    if (!canEdit) return;
    setState('saving');
    try { await updateGlobalPrefs(form); setInitial(form); show('Saved', 'success'); setState('idle'); }
    catch (e) { show(e?.response?.data?.message || 'Save failed', 'error'); setState('idle'); }
  }

  function input(name, props={}){
    return <input disabled={!canEdit} className="border rounded px-3 py-2 w-full" value={form[name] || ''} onChange={e=>setForm(f=>({...f,[name]: e.target.value}))} {...props} />
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold mb-4">Global Preferences</h1>
          {state === 'loading' ? <div>Loading…</div> : state === 'error' ? (
            <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load preferences.</div>
          ) : (
            <div className="space-y-4">
              <Field label="Allowed Languages (comma-separated)">{input('languages')}</Field>
              <Field label="Feature Toggles JSON">{input('feature_toggles')}</Field>
              <div className="pt-2"><Button onClick={onSave} disabled={!canEdit || !dirty || state==='saving'}>{state==='saving'? 'Saving…':'Save'}</Button></div>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function Field({ label, children }){
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}


