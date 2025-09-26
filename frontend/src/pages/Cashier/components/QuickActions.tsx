import React from 'react';
import { CircleDollarSign, FilePlus2, Printer, Search } from 'lucide-react';

export default function QuickActions() {
  const base = 'w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md active:scale-[.99]';
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-transparent hover:ring-slate-100 transition">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button className={[base, 'bg-slate-900 text-white'].join(' ')}>
          <CircleDollarSign className="h-4 w-4" />
          Record Payment
        </button>
        <button className={[base, 'bg-white text-slate-900 border border-slate-200'].join(' ')}>
          <FilePlus2 className="h-4 w-4" />
          Create Invoice
        </button>
        <button className={[base, 'bg-white text-slate-900 border border-slate-200'].join(' ')}>
          <Search className="h-4 w-4" />
          Search Student
        </button>
        <button className={[base, 'bg-white text-slate-900 border border-slate-200'].join(' ')}>
          <Printer className="h-4 w-4" />
          Print Day Summary
        </button>
      </div>
    </div>
  );
}


