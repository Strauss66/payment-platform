import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import NoTenantBanner from '../../components/NoTenantBanner.jsx';
import Button from '../../components/ui/Button.jsx';
import { listInvoicingEntities } from '../../lib/api.billing.js';
import { updateEmitterCFDI, testStampEmitterCFDI } from '../../lib/api.billing.js';
import regimenFiscal from '../../lib/sat/catalogs/regimenFiscal.json';
import { useToast } from '../../components/ui/Toast.jsx';

export default function EmitterCFDIPage(){
  const { currentSchoolId } = useTenant();
  const { show } = useToast();
  const [state, setState] = useState('idle');
  const [entities, setEntities] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ rfc: '', regimenFiscal: '', pacProvider: 'sandbox', pacCredentials: '', csdCertB64: '', csdKeyB64: '', csdPass: '' });
  const [certMeta, setCertMeta] = useState({ serial: '', validFrom: '', validTo: '' });

  useEffect(() => { load(); }, [currentSchoolId]);

  async function load(){
    if (!currentSchoolId) return;
    setState('loading');
    try {
      const { rows } = await listInvoicingEntities();
      setEntities(rows);
      const def = rows.find(r => r.is_default) || rows[0];
      setSelectedId(def?.id || '');
      setForm((f) => ({ ...f, rfc: def?.rfc || '', regimenFiscal: def?.regimen_fiscal || '', pacProvider: def?.pac_provider || 'sandbox' }));
      setCertMeta({ serial: def?.cert_serial || '', validFrom: def?.cert_valid_from || '', validTo: def?.cert_valid_to || '' });
      setState('idle');
    } catch (e) { setState('error'); }
  }

  function onFileToB64(field){
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, [field]: String(reader.result).split(',').pop() }));
      reader.readAsDataURL(file);
    };
  }

  async function onSave(){
    if (!selectedId) return;
    setState('saving');
    try {
      const payload = { rfc: form.rfc, regimenFiscal: form.regimenFiscal, pacProvider: form.pacProvider, pacCredentials: form.pacCredentials ? JSON.parse(form.pacCredentials) : undefined, csdCertB64: form.csdCertB64 || undefined, csdKeyB64: form.csdKeyB64 || undefined, csdPass: form.csdPass || undefined };
      const res = await updateEmitterCFDI(selectedId, payload);
      setCertMeta({ serial: res?.cert_serial || '', validFrom: res?.cert_valid_from || '', validTo: res?.cert_valid_to || '' });
      show('Emitter CFDI saved');
      setState('idle');
    } catch (e) { show(e?.response?.data?.message || 'Save failed', 'error'); setState('idle'); }
  }

  async function onTest(){
    if (!selectedId) return;
    setState('testing');
    try {
      const res = await testStampEmitterCFDI(selectedId);
      show(`Test stamp ok: ${res?.uuid || 'UUID'}`);
    } catch (e) { show(e?.response?.data?.message || 'Test failed', 'error'); }
    setState('idle');
  }

  if (!currentSchoolId) return <NoTenantBanner/>;

  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="p-6 max-w-3xl">
          <h1 className="text-xl font-semibold mb-4">Emitter (CFDI)</h1>

          {state === 'loading' ? <Skeleton/> : state === 'error' ? <InlineError retry={load}/> : (
            <div className="space-y-4">
              <div>
                <label className="text-xs block mb-1">Invoicing Entity</label>
                <select value={selectedId} onChange={e=>setSelectedId(e.target.value)} className="border rounded px-2 py-2">
                  {entities.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1">RFC</label>
                  <input value={form.rfc} onChange={e=>setForm(f=>({...f, rfc: e.target.value.toUpperCase().trim()}))} placeholder="XAXX010101000" className="border rounded px-2 py-2 w-full" />
                </div>
                <div>
                  <label className="text-xs block mb-1">Régimen Fiscal</label>
                  <select value={form.regimenFiscal} onChange={e=>setForm(f=>({...f, regimenFiscal: e.target.value}))} className="border rounded px-2 py-2 w-full">
                    <option value="">Select…</option>
                    {regimenFiscal.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.label}</option>)}
                  </select>
                </div>
              </div>

              <fieldset className="border rounded p-3">
                <legend className="px-1 text-sm">CSD (certificate)</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs block mb-1">.cer file</label>
                    <input type="file" accept=".cer" onChange={onFileToB64('csdCertB64')} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">.key file</label>
                    <input type="file" accept=".key" onChange={onFileToB64('csdKeyB64')} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Password</label>
                    <input type="password" value={form.csdPass} onChange={e=>setForm(f=>({...f, csdPass: e.target.value}))} className="border rounded px-2 py-2 w-full" />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Serial / Validity</label>
                    <div className="text-sm text-gray-600">{certMeta.serial ? `${certMeta.serial} — ${new Date(certMeta.validFrom).toLocaleDateString()} → ${new Date(certMeta.validTo).toLocaleDateString()}` : '—'}</div>
                  </div>
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs block mb-1">PAC Provider</label>
                  <select value={form.pacProvider} onChange={e=>setForm(f=>({...f, pacProvider: e.target.value}))} className="border rounded px-2 py-2 w-full">
                    <option value="sandbox">sandbox</option>
                    <option value="prod">production (later)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs block mb-1">PAC Credentials (JSON)</label>
                  <textarea value={form.pacCredentials} onChange={e=>setForm(f=>({...f, pacCredentials: e.target.value}))} placeholder='{"user":"...","pass":"..."}' className="border rounded px-2 py-2 w-full h-20" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={onSave} disabled={!selectedId || state==='saving'}>Save</Button>
                <Button onClick={onTest} variant="secondary" disabled={!selectedId || !certMeta.serial || state==='testing'}>Test stamp</Button>
              </div>
            </div>
          )}
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}

function Skeleton(){
  return <div className="space-y-2 animate-pulse"><div className="h-4 bg-gray-200 w-1/3"/><div className="h-32 bg-gray-200"/></div>;
}
function InlineError({ retry }){
  return <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load. <button onClick={retry} className="underline">Retry</button></div>;
}


