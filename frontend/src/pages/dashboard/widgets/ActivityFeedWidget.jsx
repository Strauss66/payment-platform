import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function ActivityFeedWidget(){
  return (
    <WidgetShell title="Activity Feed" to="/app/activity">
      <div className="text-sm text-gray-500">No recent activity (mock)</div>
    </WidgetShell>
  );
}


