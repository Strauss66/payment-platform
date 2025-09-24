import React, { useEffect, useState } from 'react';
import { Sheet } from '../../components/ui/Sheet.jsx';
import Button from '../../components/ui/Button.jsx';
import { getFamilyTaxIdentity, upsertFamilyTaxIdentity } from '../../lib/api.billing.js';
import usoCfdi from '../../lib/sat/catalogs/usoCfdi.json';
import regimenFiscal from '../../lib/sat/catalogs/regimenFiscal.json';
import { useToast } from '../../components/ui/Toast.jsx';

export default function FamilyTaxDrawer({ familyId, open, onClose, onSaved }){
  const [state, setState] = useState('idle');
  const [form, setForm] = useState({ rfc: '', name: '', usoCfdi: '', postalCode: '', regimenFiscalReceptor: '' });
  const { show } = useToast();

  useEffect(() => { if (open) load(); }, [open, familyId]);

  async function load(){
    if (!familyId) return;
    setState('loading');
    try {
      const data = await getFamilyTaxIdentity(familyId);
      setForm({ rfc: data?.rfc || '', name: data?.name || '', usoCfdi: data?.uso_cfdi || '', postalCode: data?.postal_code || '', regimenFiscalReceptor: data?.regimen_fiscal_receptor || '' });
      setState('idle');
    } catch (e) { setState('error'); }
  }

  async function onSave(){
    setState('saving');
    try {
      await upsertFamilyTaxIdentity(familyId, { rfc: form.rfc, name: form.name, usoCfdi: form.usoCfdi, postalCode: form.postalCode, regimenFiscalReceptor: form.regimenFiscalReceptor || undefined });
      show('Family tax identity saved');
      setState('idle');
      onSaved && onSaved();
      onClose && onClose();
    } catch (e) { show(e?.response?.data?.message || 'Save failed', 'error'); setState('idle'); }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Family Tax Identity">
      {state === 'loading' ? <Skeleton/> : state === 'error' ? <InlineError retry={load}/> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1">RFC</label>
              <input value={form.rfc} onChange={e=>setForm(f=>({...f, rfc: e.target.value.toUpperCase().trim()}))} className="border rounded px-2 py-2 w-full" />
            </div>
            <div>
              <label className="text-xs block mb-1">Uso CFDI</label>
              <select value={form.usoCfdi} onChange={e=>setForm(f=>({...f, usoCfdi: e.target.value}))} className="border rounded px-2 py-2 w-full">
                <option value="">Select…</option>
                {usoCfdi.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs block mb-1">Name / Razón Social</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} className="border rounded px-2 py-2 w-full" />
            </div>
            <div>
              <label className="text-xs block mb-1">Código Postal</label>
              <input value={form.postalCode} maxLength={5} onChange={e=>setForm(f=>({...f, postalCode: e.target.value.replace(/[^0-9]/g,'').slice(0,5)}))} className="border rounded px-2 py-2 w-full" />
            </div>
            <div>
              <label className="text-xs block mb-1">Régimen Fiscal Receptor (opcional)</label>
              <select value={form.regimenFiscalReceptor} onChange={e=>setForm(f=>({...f, regimenFiscalReceptor: e.target.value}))} className="border rounded px-2 py-2 w-full">
                <option value="">—</option>
                {regimenFiscal.map(opt => <option key={opt.code} value={opt.code}>{opt.code} - {opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={onSave} disabled={state==='saving' || !form.rfc || !form.name || !form.usoCfdi || (form.postalCode || '').length !== 5}>Save</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Skeleton(){ return <div className="space-y-2 animate-pulse"><div className="h-4 bg-gray-200 w-1/3"/><div className="h-32 bg-gray-200"/></div>; }
function InlineError({ retry }){ return <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load. <button onClick={retry} className="underline">Retry</button></div>; }


