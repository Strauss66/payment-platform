import React from 'react';

type Row = {
  student: string;
  invoice: string;
  amount: string;
  dueDate: string;
  status: 'Overdue' | 'Pending';
};

const defaultRows: Row[] = [
  { student: 'Ethan Carter', invoice: 'INV-2023-001', amount: '$500.00', dueDate: '2023-08-15', status: 'Overdue' },
  { student: 'Olivia Bennett', invoice: 'INV-2023-002', amount: '$750.00', dueDate: '2023-08-20', status: 'Pending' },
  { student: 'Noah Thompson', invoice: 'INV-2023-003', amount: '$300.00', dueDate: '2023-08-25', status: 'Pending' },
];

export function AttentionTableSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="h-5 w-48 bg-slate-100 rounded" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-50 rounded" />
        ))}
      </div>
    </div>
  );
}

export default function AttentionNeededTable({ rows = defaultRows, loading = false }: { rows?: Row[]; loading?: boolean }) {
  if (loading) return <AttentionTableSkeleton />;
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <h3 className="text-slate-900 font-semibold">Attention Needed</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-slate-600">
              <th className="py-3 pr-6 font-medium">Student Name</th>
              <th className="py-3 pr-6 font-medium">Invoice #</th>
              <th className="py-3 pr-6 font-medium">Amount</th>
              <th className="py-3 pr-6 font-medium">Due Date</th>
              <th className="py-3 pr-6 font-medium">Status</th>
              <th className="py-3 pr-0 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.invoice} className="group hover:bg-slate-50/60">
                <td className="py-3 pr-6 whitespace-nowrap text-slate-800">{r.student}</td>
                <td className="py-3 pr-6 text-slate-700">{r.invoice}</td>
                <td className="py-3 pr-6 tabular-nums text-slate-800">{r.amount}</td>
                <td className="py-3 pr-6 text-slate-700">{r.dueDate}</td>
                <td className="py-3 pr-6">
                  {r.status === 'Overdue' ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">Overdue</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">Pending</span>
                  )}
                </td>
                <td className="py-3 pr-0 text-right">
                  <button className="text-sky-600 hover:underline font-medium">Send Reminder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


