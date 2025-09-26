import React from 'react';

type Row = { label: string; value: number };

const defaultRows: Row[] = [
  { label: 'Credit Card', value: 65 },
  { label: 'Online Transfer', value: 25 },
  { label: 'Cash', value: 10 },
];

export default function PaymentMethodsMix({ rows = defaultRows }: { rows?: Row[] }) {
  const max = Math.max(...rows.map(r => r.value), 100);
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="text-slate-900 font-semibold">Payment Methods Mix</h3>
          <p className="text-sm text-slate-600">This Month</p>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-12 items-center gap-3">
            <div className="col-span-4 md:col-span-5 text-sm text-slate-700">{r.label}</div>
            <div className="col-span-6 md:col-span-6">
              <div className="h-2.5 w-full rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900/70"
                  style={{ width: `${(r.value / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 text-right text-sm text-slate-700 tabular-nums">{r.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}


