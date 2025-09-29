import React from 'react';

type Column<T> = { key: keyof T & string; label: string; render?: (row: T) => React.ReactNode; className?: string };

export default function DataTable<T extends Record<string, any>>({ columns, rows, onRowClick, emptyText = 'No data' }:{ columns: Column<T>[]; rows: T[]; onRowClick?: (row:T)=>void; emptyText?: string; }){
  if (!rows || rows.length === 0) {
    return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">{emptyText}</div>;
  }
  return (
    <div className="rounded-2xl border overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              {columns.map((c) => (
                <th key={String(c.key)} className="text-left font-medium text-slate-600 px-4 py-2 whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className={`hover:bg-slate-50 ${i % 2 === 1 ? 'bg-slate-50/40' : ''} ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                {columns.map((c) => (
                  <td key={String(c.key)} className={`px-4 py-2 whitespace-nowrap ${c.className || ''}`}>{c.render ? c.render(row) : String(row[c.key] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


