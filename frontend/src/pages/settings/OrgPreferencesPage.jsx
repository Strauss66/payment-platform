import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listOrgPrefs, updateOrgPrefs } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function OrgPreferencesPage(){
  const { show } = useToast();
  const [state, setState] = useState('idle');
  const [form, setForm] = useState({});
  const [initial, setInitial] = useState({});

  async function load(){
    setState('loading');
    try { const data = await listOrgPrefs(); setForm(data); setInitial(data); setState('idle'); }
    catch { setState('error'); }
  }
  useEffect(() => { load(); }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  async function onSave(){
    setState('saving');
    try { await updateOrgPrefs(form); setInitial(form); show('Saved', 'success'); setState('idle'); }
    catch (e) { show(e?.response?.data?.message || 'Save failed', 'error'); setState('idle'); }
  }

  function input(name, props={}){
    return <input className="border rounded px-3 py-2 w-full" value={form[name] || ''} onChange={e=>setForm(f=>({...f,[name]: e.target.value}))} {...props} />
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold mb-4">Org Preferences</h1>
          {state === 'loading' ? <div>Loading…</div> : state === 'error' ? (
            <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load preferences.</div>
          ) : (
            <div className="space-y-4">
              <Field label="Default School Year">{input('default_school_year')}</Field>
              <Field label="Timezone">{input('timezone')}</Field>
              <Field label="Admissions Contact">{input('contact_admissions')}</Field>
              <Field label="Finance Contact">{input('contact_finance')}</Field>
              <Field label="Support Contact">{input('contact_support')}</Field>
              <Field label="Privacy Policy URL">{input('privacy_url')}</Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Late Fee %">{input('late_fee_pct', { type:'number', step:'0.01' })}</Field>
                <Field label="Dunning Cadence">{input('dunning_cadence')}</Field>
              </div>
              <div className="pt-2"><Button onClick={onSave} disabled={!dirty || state==='saving'}>{state==='saving'? 'Saving…':'Save'}</Button></div>
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


