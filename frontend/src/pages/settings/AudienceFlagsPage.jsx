import React, { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { listAudienceFlags, updateAudienceFlags } from '../../lib/api.billing';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

export default function AudienceFlagsPage(){
  const { show } = useToast();
  const [state, setState] = useState('idle');
  const [flags, setFlags] = useState([]);
  const [dirty, setDirty] = useState(false);

  async function load(){
    setState('loading');
    try { const data = await listAudienceFlags(); setFlags(data); setDirty(false); setState('idle'); }
    catch { setState('error'); }
  }
  useEffect(() => { load(); }, []);

  function toggle(i){
    setFlags((arr) => arr.map((f, idx) => idx===i ? { ...f, enabled: !f.enabled } : f));
    setDirty(true);
  }

  async function onSave(){
    setState('saving');
    try { await updateAudienceFlags({ flags }); setDirty(false); show('Saved', 'success'); setState('idle'); }
    catch (e) { show(e?.response?.data?.message || 'Save failed', 'error'); setState('idle'); }
  }

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold mb-4">Audience Flags</h1>
          {state === 'loading' ? <div>Loading…</div> : state === 'error' ? (
            <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load flags.</div>
          ) : (
            <div className="space-y-3">
              {(flags || []).map((f, idx) => (
                <div key={f.key || idx} className="flex items-center justify-between p-3 border rounded bg-white">
                  <div>
                    <div className="font-medium">{f.name || f.key}</div>
                    <div className="text-sm text-gray-600">{f.description || ''}</div>
                  </div>
                  <button role="switch" aria-checked={!!f.enabled} onClick={()=>toggle(idx)} className={`px-3 py-1.5 rounded ${f.enabled? 'bg-green-600 text-white':'bg-gray-200'}`}>{f.enabled? 'On':'Off'}</button>
                </div>
              ))}
              <div className="pt-2"><Button onClick={onSave} disabled={!dirty || state==='saving'}>{state==='saving'? 'Saving…':'Save'}</Button></div>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


