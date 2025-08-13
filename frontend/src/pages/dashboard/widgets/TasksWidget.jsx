import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function TasksWidget(){
  return (
    <WidgetShell title="Tasks" to="/app/tasks">
      <div className="text-sm text-gray-500">You're all caught up (mock)</div>
    </WidgetShell>
  );
}


