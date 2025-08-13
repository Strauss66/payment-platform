import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function AlertsWidget(){
  return (
    <WidgetShell title="Alerts" to="/app/alerts">
      <div className="text-sm text-gray-500">No alerts (mock)</div>
    </WidgetShell>
  );
}


