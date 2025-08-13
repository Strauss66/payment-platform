// src/features/dashboard/PortalDashboardPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import WidgetGrid from "../../../components/dashboard/WidgetGrid";
import { fetchDashboardLayout, saveDashboardLayout } from "../../../lib/dashboard";

const DEFAULT_LAYOUT = [
  { i: "currentBalance", x: 0, y: 0, w: 4, h: 6, minW: 3, minH: 4, label: "Current Balance", href: "/app/payments" },
  { i: "recentInvoices", x: 4, y: 0, w: 4, h: 6, minW: 3, minH: 4, label: "Recent Invoices", href: "/app/invoices" },
  { i: "recentPayments", x: 8, y: 0, w: 4, h: 6, minW: 3, minH: 4, label: "Recent Payments", href: "/app/payments" },
  { i: "gettingStarted", x: 0, y: 6, w: 12, h: 5, minW: 6, minH: 4, label: "Getting Started", href: "/app" }
];

export default function PortalDashboardPage(){
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await fetchDashboardLayout('portal');
        if (Array.isArray(saved) && saved.length > 0) setLayout(saved);
      } catch {
        // ignore: first time users will have no layout
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveDashboardLayout('portal', layout);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setLayout(DEFAULT_LAYOUT);

  const renderWidget = (key) => {
    switch (key) {
      case 'currentBalance':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Outstanding</div>
            <div className="text-3xl font-semibold text-green-600">$0.00</div>
            <div className="text-xs text-gray-400 mt-1">No outstanding balance</div>
          </div>
        );
      case 'recentInvoices':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Invoices (last 30d)</div>
            <div className="text-3xl font-semibold text-blue-600">0</div>
            <div className="text-xs text-gray-400 mt-1">No recent invoices</div>
          </div>
        );
      case 'recentPayments':
        return (
          <div>
            <div className="text-sm text-gray-500 mb-1">Payments (last 30d)</div>
            <div className="text-3xl font-semibold text-emerald-600">0</div>
            <div className="text-xs text-gray-400 mt-1">No recent payments</div>
          </div>
        );
      case 'gettingStarted':
      default:
        return (
          <div className="text-gray-600">
            This dashboard will show your school information, invoices, payments, and other important details. Drag and resize widgets, then click Save.
          </div>
        );
    }
  };

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Portal Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">Reset</button>
          <button onClick={handleSave} disabled={saving} className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <WidgetGrid
        layout={layout}
        onLayoutChange={setLayout}
        renderWidget={renderWidget}
      />
    </div>
  );
}