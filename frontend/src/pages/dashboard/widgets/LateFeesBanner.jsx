import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function LateFeesBanner(){
  return (
    <WidgetShell title="Late Fees" to="/app/billing/late-fees">
      <div className="text-sm text-gray-500">You're in good standing (mock)</div>
    </WidgetShell>
  );
}


