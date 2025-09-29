import React from 'react';
import ProtectedRoute from '../../app/guards/ProtectedRoute';
import RoleGate from '../../app/guards/RoleGate';
import { ROLES } from '../../contexts/AuthContext';

export default function PaymentDetailPage(){
  return (
    <ProtectedRoute>
      <RoleGate allow={[ROLES.CASHIER, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <div className="space-y-4">
          <div className="text-2xl font-semibold">Payment Detail</div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="text-sm text-slate-600 mb-1">Balance</div>
                <div className="text-3xl font-semibold tracking-tight">$0.00</div>
                <div className="mt-2 text-sm text-slate-600">Past Due: $0 · Next Due: $0</div>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="font-medium">Tuition Plan</div>
                <div className="text-sm text-slate-600">Standard Plan – Monthly Payments</div>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="font-medium">Scholarships & Discounts</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">Merit Scholarship</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">Sibling Discount</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-2xl border bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="font-medium mb-3">Timeline</div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center justify-between">
                    <span>Payment Received · INV-2024-001</span>
                    <span className="text-emerald-600 font-medium">+$1,200.00</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Invoice Generated · INV-2024-001</span>
                    <span className="text-slate-700">$1,200.00</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-rose-700">Invoice Overdue</span>
                    <span className="text-rose-700 font-medium">$1,200.00</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </RoleGate>
    </ProtectedRoute>
  );
}


