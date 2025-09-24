import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { getInvoiceCFDIPreview, stampInvoiceCFDI } from '../../lib/api.billing.js';
import { useToast } from '../ui/Toast.jsx';

export default function CFDIPreviewModal({ invoiceId, onClose, onStamped }){
  const [state, setState] = useState('idle');
  const [data, setData] = useState(null);
  const [showXml, setShowXml] = useState(false);
  const { show } = useToast();

  useEffect(() => { load(); }, [invoiceId]);
  async function load(){
    setState('loading');
    try {
      const res = await getInvoiceCFDIPreview(invoiceId);
      setData(res);
      setState('idle');
    } catch (e) { setState('error'); }
  }

  async function onStamp(){
    setState('stamping');
    try {
      const res = await stampInvoiceCFDI(invoiceId);
      show(`Stamped: ${res?.uuid || ''}`);
      onStamped && onStamped(res);
      onClose && onClose();
    } catch (e) { show(e?.response?.data?.message || 'Stamp failed', 'error'); setState('idle'); }
  }

  return (
    <Modal open onClose={onClose} title={`CFDI Preview #${invoiceId}`}>
      {state === 'loading' ? <Skeleton/> : state === 'error' ? <InlineError retry={load}/> : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-2 border rounded">
              <div className="text-xs text-gray-500">Subtotal</div>
              <div className="font-semibold">${Number(data.totals?.subtotal || 0).toFixed(2)}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-xs text-gray-500">IVA</div>
              <div className="font-semibold">${Number(data.totals?.taxes || 0).toFixed(2)}</div>
            </div>
            <div className="p-2 border rounded">
              <div className="text-xs text-gray-500">Total</div>
              <div className="font-semibold">${Number(data.totals?.total || 0).toFixed(2)}</div>
            </div>
          </div>

          <button className="text-sm underline" onClick={()=>setShowXml(v=>!v)}>{showXml ? 'Hide' : 'Show'} XML</button>
          {showXml && (
            <pre className="text-xs max-h-64 overflow-auto border rounded p-2 bg-gray-50 whitespace-pre-wrap">{data.xmlDraft}</pre>
          )}

          <div className="flex gap-2 justify-end">
            <Button onClick={onStamp} disabled={state==='stamping'}>Stamp</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function Skeleton(){ return <div className="space-y-2 animate-pulse"><div className="h-4 bg-gray-200 w-1/3"/><div className="h-32 bg-gray-200"/></div>; }
function InlineError({ retry }){ return <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">Failed to load. <button onClick={retry} className="underline">Retry</button></div>; }


