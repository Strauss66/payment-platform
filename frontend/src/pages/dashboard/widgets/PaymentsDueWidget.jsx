import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function PaymentsDueWidget(){
  return (
    <WidgetShell title="Payments Due" to="/app/billing/payments">
      <div className="text-sm text-gray-500">No data yet (mock)</div>
    </WidgetShell>
  );
}


