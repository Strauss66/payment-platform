import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices } from '../../../../lib/api.billing';
import { useTenant } from '../../../../contexts/TenantContext';
import { Table, THead, TR, TD } from '../../../ui/Table';

export default function CashierInvoicesDue(){
  const { currentSchoolId } = useTenant();
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('idle');
  useEffect(() => {
    if (!currentSchoolId) return;
    (async () => {
      setState('loading');
      try {
        const to = new Date(); to.setDate(to.getDate() + 7);
        const from = new Date();
        const { rows } = await listInvoices({ status: 'open', dueFrom: from.toISOString(), dueTo: to.toISOString() });
        setRows(rows); setState('idle');
      } catch { setState('error'); }
    })();
  }, [currentSchoolId]);
  if (!currentSchoolId) return <MiniBanner/>;
  if (state === 'loading') return <Skeleton/>;
  if (state === 'error') return <InlineError retry={() => window.location.reload()}/>;
  if (rows.length === 0) return <EmptyCTA/>;
  return (
    <div>
      <Table head={<THead columns={[{label:'Student'}, {label:'Due'}, {label:'Balance'}, {label:'Action', right:true}]} />}>
        {rows.map(r => (
          <TR key={r.id}>
            <TD>#{r.student_id}</TD>
            <TD>{String(r.due_date).slice(0,10)}</TD>
            <TD>${Number(r.balance || 0).toFixed(2)}</TD>
            <TD right>
              <a className="text-blue-600" href={`/app/cashier?student=${r.student_id}`} title="Open Cashier Panel with this student preselected">Collect</a>
            </TD>
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
      <div className="h-24 bg-gray-200 rounded w-full"/>
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
      <div>No invoices due in the next 7 days.</div>
    </div>
  );
}


