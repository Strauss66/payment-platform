import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function BalancesWidget(){
  return (
    <WidgetShell title="Balances" action={<a href="#/" className="text-sm text-[var(--primary)]">Pay Now</a>} to="/app/billing/payments">
      <div className="text-sm text-[var(--text)]">
        <div className="flex items-center justify-between py-1">
          <span className="text-[var(--text-muted)]">Current Balance</span>
          <span className="font-semibold">$0.00</span>
        </div>
        <div className="mt-2 text-[12px] text-[var(--text-muted)]">You're all set. No balance due.</div>
      </div>
    </WidgetShell>
  );
}


