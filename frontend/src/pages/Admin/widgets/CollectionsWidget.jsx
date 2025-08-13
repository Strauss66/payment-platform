import React, { useEffect, useMemo, useState } from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';
import { mockApi } from '../../../lib/api.ts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../../../components/ui/Sheet';

// type CollectionRow = { studentId: number; name: string; grade: string; daysLate: number; amount: number }

export default function CollectionsWidget(){
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await mockApi.getOverdueCollections();
      setRows(data.rows || []);
    })();
  }, []);

  const columns = useMemo(() => ['Student', 'Grade', 'Days Late', 'Amount', 'Action'], []);

  const onRowAction = (row) => {
    setSelected(row);
    setOpen(true);
  };

  return (
    <WidgetShell title="Collections (Top 10 Overdue)" to="/app/admin/collections">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              {columns.map(c => <th key={c} className="py-2 pr-3 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.studentId} className="border-t">
                <td className="py-2 pr-3">{r.name}</td>
                <td className="py-2 pr-3">{r.grade}</td>
                <td className="py-2 pr-3">{r.daysLate}</td>
                <td className="py-2 pr-3">${r.amount.toFixed(2)}</td>
                <td className="py-2 pr-3">
                  <button onClick={() => onRowAction(r)} className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Start Dunning</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Start Dunning</SheetTitle>
            <SheetDescription>Preview and start a dunning cadence for this account.</SheetDescription>
          </SheetHeader>
          {!!selected && (
            <div className="text-sm">
              <div className="font-medium mb-1">{selected.name}</div>
              <div className="text-gray-500 mb-4">Days late: {selected.daysLate} • Amount: ${selected.amount.toFixed(2)}</div>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700">
                <li>Send reminder email now</li>
                <li>Follow-up SMS in 3 days</li>
                <li>Phone call task after 7 days</li>
              </ol>
            </div>
          )}
          <SheetFooter>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm border rounded">Cancel</button>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white">Start</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </WidgetShell>
  );
}

