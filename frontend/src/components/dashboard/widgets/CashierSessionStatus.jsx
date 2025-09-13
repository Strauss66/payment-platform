import React from 'react';
import { useTenant } from '../../../contexts/TenantContext';

export default function CashierSessionStatus(){
  const { currentSchoolId } = useTenant();
  if (!currentSchoolId) return <MiniBanner/>;
  return (
    <div className="p-3 rounded border bg-white">
      <div className="text-xs text-gray-500 mb-1">Register Session</div>
      <div className="text-lg font-semibold">Status: <span className="text-red-600">CLOSED</span></div>
      <div className="text-sm text-gray-600">Open a session in Cashier Panel.</div>
      <a className="inline-block mt-2 px-3 py-1.5 text-sm rounded bg-blue-600 text-white" href="/app/cashier">Go to Cashier Panel</a>
    </div>
  );
}

function MiniBanner(){
  return <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">Select a school to continue.</div>;
}


