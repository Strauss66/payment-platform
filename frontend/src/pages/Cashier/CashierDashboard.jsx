import React from 'react';
import AppShell from '../../layouts/AppShell.tsx';
import TimeRangeToggle from './components/TimeRangeToggle.tsx';
import MetricCard from './components/MetricCard.tsx';
import DailyCollectionsChart from './components/DailyCollectionsChart.tsx';
import PaymentMethodsMix from './components/PaymentMethodsMix.tsx';
import AttentionNeededTable from './components/AttentionNeededTable.tsx';
import QuickActions from './components/QuickActions.tsx';

export default function CashierDashboard() {
  const rightSlot = <TimeRangeToggle />;
  return (
    <AppShell title="Dashboard" rightSlot={rightSlot}>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Today's Collections" value="$2,450" />
        <MetricCard title="Pending Invoices" value={123} />
        <MetricCard title="Overdue Invoices" value={45} tone="danger" />
        <MetricCard title="Active Discounts" value="15%" />
      </section>

      <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyCollectionsChart />
        <PaymentMethodsMix />
      </section>

      <section className="mt-6">
        <AttentionNeededTable />
      </section>

      <section className="mt-6">
        <QuickActions />
      </section>

      {process.env.NODE_ENV === 'development' && (
        <section className="mt-10 space-y-6">
          <h2 className="text-slate-900 font-semibold">Playground</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Metric" value="123" />
            <MetricCard title="Metric" value="45" tone="danger" />
            <MetricCard title="Metric" value="15%" />
            <MetricCard title="Metric" value="$1,200" />
          </div>
        </section>
      )}
    </AppShell>
  );
}