import React, { useEffect, useState } from 'react';
import { api } from '../../lib/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { Table, THead, TR, TD } from '../ui/Table';

export default function StatementWidget({ studentId }){
  const { user } = useAuth();
  const { currentSchoolId } = useTenant();
  const [data, setData] = useState({ invoices: [], summary: null });
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (!studentId || !currentSchoolId) return;
    setState('loading');
    api.get(`/api/portal/statement/${studentId}`).then(({ data }) => {
      setData(data);
      setState('idle');
    }).catch(() => setState('error'));
  }, [studentId, currentSchoolId]);

  if (state === 'loading') return <div>Loading statement…</div>;
  if (state === 'error') return <div className="text-red-600">Failed to load statement.</div>;

  const { invoices, summary } = data;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Statement</h3>
      {(!invoices || invoices.length === 0) ? (
        <div className="text-gray-600">No invoices.</div>
      ) : (
        <Table head={<THead columns={[{label:'Invoice #'}, {label:'Due Date'}, {label:'Total'}, {label:'Balance'}, {label:'Late Fee'}]} />}>
          {invoices.map(inv => (
            <TR key={inv.id}>
              <TD>{inv.id}</TD>
              <TD>{inv.due_date?.slice(0,10)}</TD>
              <TD>${Number(inv.total).toFixed(2)}</TD>
              <TD>${Number(inv.balance).toFixed(2)}</TD>
              <TD>${Number(inv.late_fee).toFixed(2)}</TD>
            </TR>
          ))}
        </Table>
      )}
      {summary && (
        <div className="mt-3 text-sm">
          <div>Total balance: ${summary.total_balance.toFixed(2)}</div>
          <div>Late fees: ${summary.total_late_fees.toFixed(2)}</div>
          <div className="font-medium">Total due: ${summary.total_due.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}


