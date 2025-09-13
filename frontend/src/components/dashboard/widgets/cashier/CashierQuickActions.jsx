import React from 'react';

export default function CashierQuickActions({ sessionOpen }){
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
      <div className="flex flex-wrap gap-2">
        <a href="/app/cashier" className="px-3 py-2 text-sm rounded bg-blue-600 text-white">Open/Close Session</a>
        <a href="/app/cashier" className={`px-3 py-2 text-sm rounded ${sessionOpen? 'bg-green-600' : 'bg-gray-300 cursor-not-allowed'} text-white`} aria-disabled={!sessionOpen}>Take Payment</a>
        <a href="/app/cashier" className="px-3 py-2 text-sm rounded bg-gray-700 text-white">Find Student</a>
      </div>
      {!sessionOpen && <div className="text-xs text-yellow-700 mt-2">Open a session in Cashier Panel to start taking payments.</div>}
    </div>
  );
}


