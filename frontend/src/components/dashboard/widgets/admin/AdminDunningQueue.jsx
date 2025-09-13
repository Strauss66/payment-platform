import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices, NoTenantError } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';
import { Table, THead, TR, TD } from '../../../ui/Table';

export default function AdminDunningQueue(){
  const { currentSchoolId } = useTenant();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('idle');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!currentSchoolId) return;
    const controller = new AbortController();
    (async () => {
      setState('loading');
      try {
        const res = await listInvoices({ status: ['open','partial'], limit: 500 }, { signal: controller.signal });
        setRows(res.rows || []); setState('idle');
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e instanceof NoTenantError) { setState('idle'); return; }
        setState('error');
      }
    })();
    return () => controller.abort();
  }, [currentSchoolId]);

  const today = new Date(); today.setHours(0,0,0,0);
  const items = useMemo(() => {
    const map = new Map();
    for (const inv of rows) {
      const key = inv.student_id;
      const due = new Date(inv.due_date); due.setHours(0,0,0,0);
      const days = Math.max(0, Math.floor((today - due) / 86400000));
      const oldest = map.get(key)?.oldest ?? 0;
      const next = {
        student_id: key,
        oldest: Math.max(oldest, days),
        balance: (map.get(key)?.balance || 0) + Number(inv.balance || 0)
      };
      map.set(key, next);
    }
    const arr = Array.from(map.values());
    for (const it of arr) {
      it.stage = it.oldest >= 90 ? '90+' : it.oldest >= 61 ? '61-90' : it.oldest >= 31 ? '31-60' : it.oldest >= 1 ? '0-30' : 'current';
      it.last_contact = null;
    }
    return arr.sort((a,b)=>b.oldest-a.oldest).slice(0,20);
  }, [rows]);

  const filtered = items.filter(r => !q || String(r.student_id).includes(q));
  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;
  if (filtered.length === 0) return <EmptyCTA/>;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Follow-up queue</div>
        <input className="border rounded px-2 py-1 text-sm" placeholder="Search student id" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <Table head={<THead columns={[{label:'Student/Family'}, {label:'Oldest Due'}, {label:'Days Late'}, {label:'Stage'}, {label:'Last Contact'}, {label:''}, {label:'Balance', right:true}]} />}> 
        {filtered.map(r => (
          <TR key={r.student_id}>
            <TD>#{r.student_id}</TD>
            <TD>{r.oldest > 0 ? 'Yes' : 'No'}</TD>
            <TD>{r.oldest}</TD>
            <TD>{r.stage}</TD>
            <TD>{r.last_contact ? new Date(r.last_contact).toLocaleDateString() : '—'}</TD>
            <TD><button className="text-blue-600 underline text-sm" onClick={() => { /* open contact/log action */ }}>Log Action</button></TD>
            <TD right>${r.balance.toFixed(2)}</TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}

function Skeleton(){
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-5/6"/>
      <div className="h-4 bg-gray-200 rounded w-2/3"/>
      <div className="h-32 bg-gray-200 rounded w-full"/>
    </div>
  );
}

function InlineError({ retry }){
  return (
    <div className="p-2 border border-red-200 bg-red-50 text-red-700 text-sm rounded">
      We couldn’t load this data. <button onClick={retry} className="underline">Retry</button>
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}

function EmptyCTA(){
  return (
    <div className="p-4 text-center text-gray-600">
      <div>All caught up — no overdue invoices.</div>
    </div>
  );
}


