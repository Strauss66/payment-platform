import React, { useEffect, useMemo, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../../components/ui/Sheet';

// type ApprovalItem = { id: string; type: 'discount'|'refund'|'role_change'; requester: string; submittedAt: string; status: 'pending'|'approved'|'rejected' }

export default function ApprovalsQueueWidget(){
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getApprovalsQueue();
      setItems(data.items || []);
    })();
  }, []);

  const pendingCount = useMemo(() => items.filter(i => i.status === 'pending').length, [items]);

  const openDetail = (item) => { setSelected(item); setOpen(true); };

  const approveAll = () => {
    const next = items.map(i => i.status === 'pending' ? { ...i, status: 'approved' } : i);
    setItems(next);
  };

  return (
    <WidgetShell title={`Approvals (${pendingCount} pending)`} action={pendingCount >= 3 ? (
      <button onClick={approveAll} className="px-2 py-1 text-xs rounded bg-emerald-600 text-white">Approve all</button>
    ) : null} to="/app/admin/approvals">
      <ul className="divide-y">
        {items.map(item => (
          <li key={item.id} className="py-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium capitalize">{item.type.replace('_',' ')}</div>
              <div className="text-xs text-gray-500">{item.requester} • {new Date(item.submittedAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${badgeClass(item.status)}`}>{item.status}</span>
              <button onClick={() => openDetail(item)} className="px-2 py-1 text-xs rounded border">View</button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Approval Detail</SheetTitle>
            <SheetDescription>Review the request details before taking action.</SheetDescription>
          </SheetHeader>
          {!!selected && (
            <div className="text-sm space-y-2">
              <div><span className="text-gray-500">Type:</span> <span className="capitalize">{selected.type.replace('_',' ')}</span></div>
              <div><span className="text-gray-500">Requester:</span> {selected.requester}</div>
              <div><span className="text-gray-500">Submitted:</span> {new Date(selected.submittedAt).toLocaleString()}</div>
              <div><span className="text-gray-500">Status:</span> {selected.status}</div>
              <div className="pt-2 text-gray-600">This is mocked data. Add fields as needed.</div>
            </div>
          )}
          <SheetFooter>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm border rounded">Close</button>
            <button onClick={() => { setItems(items.map(i => i.id === selected.id ? { ...i, status: 'approved' } : i)); setOpen(false); }} className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white">Approve</button>
            <button onClick={() => { setItems(items.map(i => i.id === selected.id ? { ...i, status: 'rejected' } : i)); setOpen(false); }} className="px-3 py-1.5 text-sm rounded bg-rose-600 text-white">Reject</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </WidgetShell>
  );
}

function badgeClass(status){
  switch(status){
    case 'approved': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    case 'rejected': return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
    default: return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
  }
}

