import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices, NoTenantError } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';
import { Table, THead, TR, TD } from '../../../ui/Table';

export default function AdminTopDebtors(){
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

  const grouped = useMemo(() => {
    const byStudent = new Map();
    for (const r of rows) {
      const key = r.student_id;
      byStudent.set(key, (byStudent.get(key) || 0) + Number(r.balance || 0));
    }
    return Array.from(byStudent.entries()).map(([student_id, balance]) => ({ student_id, balance })).sort((a,b)=>b.balance-a.balance).slice(0,10);
  }, [rows]);

  const filtered = grouped.filter(r => !q || String(r.student_id).includes(q));

  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;
  if (filtered.length === 0) return <EmptyCTA/>;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">Top outstanding balances</div>
        <input className="border rounded px-2 py-1 text-sm" placeholder="Search student id" value={q} onChange={e=>setQ(e.target.value)} />
      </div>
      <Table head={<THead columns={[{label:'Student/Family'}, {label:'Level'}, {label:'Balance', right:true}, {label:''}]} />}>
        {filtered.map(r => (
          <TR key={r.student_id}>
            <TD>#{r.student_id}</TD>
            <TD>—</TD>
            <TD right>${r.balance.toFixed(2)}</TD>
            <TD><button className="text-blue-600 underline text-sm" onClick={() => { /* open entity */ }}>Open</button></TD>
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
      <div>No families with outstanding balance.</div>
    </div>
  );
}


