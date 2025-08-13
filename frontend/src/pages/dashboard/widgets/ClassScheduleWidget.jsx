import React from 'react';
import WidgetShell from '../../../components/dashboard/WidgetShell';

export default function ClassScheduleWidget(){
  return (
    <WidgetShell title="Class Schedule" to="/app/schedule">
      <div className="text-sm text-gray-500">No classes scheduled (mock)</div>
    </WidgetShell>
  );
}


