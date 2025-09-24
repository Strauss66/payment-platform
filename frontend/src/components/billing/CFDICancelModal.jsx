import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { cancelInvoiceCFDI } from '../../lib/api.billing.js';
import motivos from '../../lib/sat/catalogs/motivoCancelacion.json';
import { useToast } from '../ui/Toast.jsx';

export default function CFDICancelModal({ invoiceId, onClose, onCanceled }){
  const [motivo, setMotivo] = useState('');
  const [folio, setFolio] = useState('');
  const [state, setState] = useState('idle');
  const { show } = useToast();

  async function onConfirm(){
    setState('saving');
    try {
      await cancelInvoiceCFDI(invoiceId, { motivo, folioSustitucion: folio || undefined });
      show('CFDI canceled');
      onCanceled && onCanceled();
      onClose && onClose();
    } catch (e) { show(e?.response?.data?.message || 'Cancel failed', 'error'); setState('idle'); }
  }

  return (
    <Modal open onClose={onClose} title={`Cancel CFDI #${invoiceId}`}>
      <div className="space-y-4">
        <div>
          <label className="text-xs block mb-1">Motivo</label>
          <select value={motivo} onChange={e=>setMotivo(e.target.value)} className="border rounded px-2 py-2 w-full">
            <option value="">Select…</option>
            {motivos.map(m => <option key={m.code} value={m.code}>{m.code} - {m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs block mb-1">Folio de sustitución (opcional)</label>
          <input value={folio} onChange={e=>setFolio(e.target.value)} className="border rounded px-2 py-2 w-full" />
        </div>
        <div className="flex gap-2 justify-end">
          <Button onClick={onConfirm} disabled={!motivo || state==='saving'}>Confirm</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}


